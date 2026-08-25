import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  CREATOR_PROFILE_DISCRIMINATOR,
  getCreatorProfileDecoder,
  TIPMARK_PROTOCOL_PROGRAM_ADDRESS,
} from "@/clients/tipmark-protocol/src";
import {
  buildCreateProfileInstruction,
  buildInitializeConfigInstruction,
  buildTipInstruction,
  buildUpdateProfileInstruction,
  simulateAndSendProtocolTransaction,
} from "@/lib/protocol/transactions";
import { deriveConfigPda, deriveProfilePda } from "@/lib/protocol/pdas";
import { createTipReference } from "@/lib/protocol/reference";
import { readTipReceipt } from "@/lib/protocol/tip-receipt";

const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "http://127.0.0.1:18899";
const CLUSTER = process.env.NEXT_PUBLIC_SOLANA_CLUSTER || "localnet";
const PROGRAM = new PublicKey(
  process.env.NEXT_PUBLIC_TIPMARK_PROGRAM_ID ||
    TIPMARK_PROTOCOL_PROGRAM_ADDRESS,
);
const UPGRADEABLE_LOADER = new PublicKey(
  "BPFLoaderUpgradeab1e11111111111111111111111",
);
const PROGRAM_SO = join(process.cwd(), "target/deploy/tipmark_protocol.so");
const REPLAY_ENABLED = process.env.TIPMARK_PROTOCOL_REPLAY === "true";

function copyBytes(value: {
  readonly [index: number]: number;
  readonly length?: number;
}): Uint8Array {
  const bytes = new Uint8Array(value.length ?? 0);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = value[index];
  }
  return bytes;
}

function assertLocalnet() {
  if (
    CLUSTER !== "localnet" ||
    !/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(RPC_URL)
  ) {
    throw new Error(
      "protocol-localnet-smoke requires NEXT_PUBLIC_SOLANA_CLUSTER=localnet and a loopback RPC",
    );
  }
}

async function waitForValidator(
  connection: Connection,
  validator: ReturnType<typeof Bun.spawn>,
) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (validator.exitCode !== null) {
      throw new Error("local validator exited before its RPC became ready");
    }
    try {
      await connection.getGenesisHash();
      return;
    } catch {
      await Bun.sleep(250);
    }
  }
  throw new Error("local validator RPC did not become ready within 30 seconds");
}

async function runCommand(
  command: string[],
  environment: Record<string, string>,
) {
  const result = Bun.spawnSync(command, {
    env: { ...process.env, ...environment },
    stdout: "pipe",
    stderr: "pipe",
  });
  if (result.exitCode !== 0) {
    throw new Error(
      `${command.join(" ")} failed:\n${Buffer.from(result.stderr).toString()}`,
    );
  }
}

async function createReplayDatabase(port: number) {
  const directory = await mkdtemp(join(tmpdir(), "tipmark-postgres-"));
  try {
    await runCommand(
      [
        "initdb",
        "--auth=trust",
        "--no-locale",
        "--username=tipmark",
        "--pgdata",
        directory,
      ],
      {},
    );
    await runCommand(
      [
        "pg_ctl",
        "--pgdata",
        directory,
        "--options",
        `-h 127.0.0.1 -p ${port}`,
        "--log",
        join(directory, "postgres.log"),
        "--wait",
        "start",
      ],
      {},
    );
    const database = "tipmark_smoke";
    const environment = {
      PGHOST: "127.0.0.1",
      PGPORT: String(port),
      PGUSER: "tipmark",
    };
    await runCommand(["createdb", database], environment);
    const url = `postgresql://tipmark@127.0.0.1:${port}/${database}`;
    await runCommand(["bunx", "prisma", "migrate", "deploy"], {
      DATABASE_URL: url,
    });
    return { directory, url };
  } catch (error) {
    await runCommand(
      ["pg_ctl", "--pgdata", directory, "--wait", "stop"],
      {},
    ).catch(() => undefined);
    await rm(directory, { recursive: true, force: true });
    throw error;
  }
}

async function stopReplayDatabase(
  database: Awaited<ReturnType<typeof createReplayDatabase>>,
) {
  await runCommand(
    ["pg_ctl", "--pgdata", database.directory, "--wait", "stop"],
    {},
  ).catch(() => undefined);
  await rm(database.directory, { recursive: true, force: true });
}

async function airdrop(connection: Connection, recipient: PublicKey) {
  const signature = await connection.requestAirdrop(
    recipient,
    5 * 1_000_000_000,
  );
  await waitForSignature(connection, signature);
}

async function waitForSignature(connection: Connection, signature: string) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const status = (await connection.getSignatureStatuses([signature]))
      .value[0];
    if (status?.err) {
      throw new Error(`local transaction failed: ${signature}`);
    }
    if (
      status?.confirmationStatus === "confirmed" ||
      status?.confirmationStatus === "finalized"
    ) {
      return;
    }
    await Bun.sleep(250);
  }
  throw new Error(`local transaction did not confirm: ${signature}`);
}

async function send(
  connection: Connection,
  signer: Keypair,
  instruction: Parameters<
    typeof simulateAndSendProtocolTransaction
  >[0]["instructions"][number],
) {
  return simulateAndSendProtocolTransaction({
    connection,
    feePayer: signer.publicKey,
    instructions: [instruction],
    sendTransaction: async (transaction, activeConnection, options) => {
      const signature = await activeConnection.sendTransaction(
        transaction,
        [signer],
        options,
      );
      await waitForSignature(activeConnection, signature);
      return signature;
    },
  });
}

const runSmoke = async (
  connection: Connection,
  authority: Keypair,
  replayDatabaseUrl?: string,
) => {
  assertLocalnet();
  const genesisHash = await connection.getGenesisHash();
  if (!genesisHash) {
    throw new Error("local validator did not return a genesis hash");
  }
  const programInfo = await connection.getAccountInfo(PROGRAM);
  if (
    !programInfo?.executable ||
    !programInfo.owner.equals(UPGRADEABLE_LOADER)
  ) {
    throw new Error("the configured local protocol program is not deployed");
  }
  const owner = Keypair.generate();
  const supporter = Keypair.generate();
  await Promise.all([
    airdrop(connection, authority.publicKey),
    airdrop(connection, owner.publicKey),
    airdrop(connection, supporter.publicKey),
  ]);

  const [configPda] = await deriveConfigPda();
  const configInfo = await connection.getAccountInfo(new PublicKey(configPda));
  if (!configInfo) {
    if (
      programInfo.data.length < 36 ||
      programInfo.data.readUInt32LE(0) !== 2
    ) {
      throw new Error("local protocol program data is not upgradeable");
    }
    const programData = new PublicKey(programInfo.data.subarray(4, 36));
    await send(
      connection,
      authority,
      await buildInitializeConfigInstruction({
        authority: authority.publicKey.toBase58(),
        programData: programData.toBase58(),
      }),
    );
  }

  const ownerAddress = owner.publicKey.toBase58();
  const [profilePda] = await deriveProfilePda(ownerAddress);
  const create = await send(
    connection,
    owner,
    await buildCreateProfileInstruction({
      owner: ownerAddress,
      payoutWallet: ownerAddress,
      username: `local-${ownerAddress.slice(0, 8).toLowerCase()}`,
      metadataUri: "ar://localnet-profile",
      metadataHash: Uint8Array.from({ length: 32 }, (_, index) => index + 1),
    }),
  );

  const profileInfo = await connection.getAccountInfo(
    new PublicKey(profilePda),
  );
  if (!profileInfo || !profileInfo.owner.equals(PROGRAM)) {
    throw new Error("profile PDA was not created by the protocol program");
  }
  if (
    !Buffer.from(profileInfo.data.subarray(0, 8)).equals(
      Buffer.from(copyBytes(CREATOR_PROFILE_DISCRIMINATOR)),
    )
  ) {
    throw new Error("profile PDA discriminator is invalid");
  }

  const profile = getCreatorProfileDecoder().decode(profileInfo.data);
  if (String(profile.owner) !== ownerAddress || profile.username.length < 2) {
    throw new Error("profile PDA data did not match the owner");
  }

  const update = await send(
    connection,
    owner,
    await buildUpdateProfileInstruction({
      owner: ownerAddress,
      payoutWallet: ownerAddress,
      metadataUri: "ar://localnet-profile-updated",
      metadataHash: Uint8Array.from({ length: 32 }, (_, index) => 32 - index),
      active: true,
    }),
  );

  const reference = createTipReference();
  const tip = await send(
    connection,
    supporter,
    buildTipInstruction({
      supporter: supporter.publicKey.toBase58(),
      profile: String(profilePda),
      payoutWallet: ownerAddress,
      amount: 1_000_000n,
      reference,
    }),
  );
  const receipt = await readTipReceipt(tip.signature, connection);
  if (
    String(receipt.event.profile) !== String(profilePda) ||
    String(receipt.event.profileOwner) !== ownerAddress ||
    String(receipt.event.supporter) !== supporter.publicKey.toBase58() ||
    receipt.event.amount !== 1_000_000n
  ) {
    throw new Error("tip receipt reconstruction did not match the transaction");
  }

  let replay;
  if (replayDatabaseUrl) {
    process.env.DATABASE_URL = replayDatabaseUrl;
    process.env.NEXT_PUBLIC_SOLANA_CLUSTER = "localnet";
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL = RPC_URL;
    const { default: db } = await import("@/db");
    const { indexProtocolTips, resetProtocolIndex } = await import(
      "@/lib/protocol/indexer"
    );
    try {
      await indexProtocolTips({ mode: "incremental", pages: 10, connection });
      const indexed = await db.protocolTip.findMany({
        select: { signature: true },
      });
      await resetProtocolIndex();
      await indexProtocolTips({ mode: "backfill", pages: 10, connection });
      const rebuilt = await db.protocolTip.findMany({
        select: { signature: true },
      });
      if (
        indexed.length !== 1 ||
        rebuilt.length !== 1 ||
        indexed[0].signature !== tip.signature ||
        rebuilt[0].signature !== tip.signature
      ) {
        throw new Error("protocol index replay did not restore the exact tip");
      }
      replay = { indexed: indexed.length, rebuilt: rebuilt.length };
    } finally {
      await db.$disconnect();
    }
  }

  console.log(
    JSON.stringify({
      cluster: CLUSTER,
      config: String(configPda),
      profile: String(profilePda),
      createSignature: create.signature,
      updateSignature: update.signature,
      tipSignature: tip.signature,
      receiptAmountLamports: receipt.event.amount.toString(),
      replay,
    }),
  );
};

const main = async () => {
  assertLocalnet();
  await access(PROGRAM_SO);
  const rpc = new URL(RPC_URL);
  const rpcPort = Number(rpc.port);
  if (!Number.isInteger(rpcPort) || rpcPort < 1024 || rpcPort > 60000) {
    throw new Error(
      "local validator RPC URL must contain a safe explicit port",
    );
  }

  const authority = Keypair.generate();
  const replayDatabase = REPLAY_ENABLED
    ? await createReplayDatabase(rpcPort + 4_000)
    : null;
  const ledger = await mkdtemp(join(tmpdir(), "tipmark-localnet-"));
  const validator = Bun.spawn(
    [
      "solana-test-validator",
      "--reset",
      "--quiet",
      "--ledger",
      ledger,
      "--rpc-port",
      String(rpcPort),
      "--faucet-port",
      String(rpcPort + 101),
      "--gossip-port",
      String(rpcPort + 102),
      "--dynamic-port-range",
      `${rpcPort + 200}-${rpcPort + 2200}`,
      "--upgradeable-program",
      PROGRAM.toBase58(),
      PROGRAM_SO,
      authority.publicKey.toBase58(),
    ],
    { stdout: "pipe", stderr: "pipe" },
  );
  const stdout = new Response(validator.stdout).text();
  const stderr = new Response(validator.stderr).text();

  try {
    const connection = new Connection(RPC_URL, "confirmed");
    await waitForValidator(connection, validator);
    await runSmoke(connection, authority, replayDatabase?.url);
  } catch (error) {
    validator.kill();
    await validator.exited;
    const output = `${await stdout}\n${await stderr}`.trim();
    if (output) console.error(output);
    throw error;
  } finally {
    if (validator.exitCode === null) {
      validator.kill();
      await validator.exited;
    }
    await rm(ledger, { recursive: true, force: true });
    if (replayDatabase) {
      await stopReplayDatabase(replayDatabase);
    }
  }
};

await main();
