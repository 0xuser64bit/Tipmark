"use client";

import {
  address,
  createNoopSigner,
  isSignerRole,
  isWritableRole,
  type Address,
  type Instruction,
} from "@solana/kit";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  type SendOptions,
  type TransactionSignature,
} from "@solana/web3.js";
import {
  getCreateProfileInstructionAsync,
  getTipInstruction,
  getUpdateProfileInstructionAsync,
} from "@/clients/tipmark-protocol/src";
import { getProtocolConfig } from "./config";

const CONFIRMATION_TIMEOUT_MS = 45_000;

export class ProtocolSimulationError extends Error {
  readonly logs: readonly string[];

  constructor(logs: readonly string[] = []) {
    super("The Solana transaction did not pass simulation.");
    this.name = "ProtocolSimulationError";
    this.logs = logs;
  }
}

export class ProtocolTransactionError extends Error {
  readonly signature: string;

  constructor(signature: string) {
    super("The submitted Solana transaction failed.");
    this.name = "ProtocolTransactionError";
    this.signature = signature;
  }
}

export interface SentProtocolTransaction {
  signature: string;
  status: "confirmed" | "submitted";
  unitsConsumed: number | null;
}

export type WalletTransactionSender = (
  transaction: Transaction,
  connection: Connection,
  options?: SendOptions,
) => Promise<TransactionSignature>;

function copyInstructionBytes(value: unknown): Uint8Array {
  const bytes = value as {
    readonly [index: number]: number;
    readonly length?: number;
  };
  const length = bytes.length ?? 0;
  const copy = new Uint8Array(length);
  for (let index = 0; index < length; index += 1) {
    copy[index] = bytes[index];
  }
  return copy;
}

/** The only compatibility boundary from generated Kit instructions to web3.js. */
export function toWeb3Instruction(
  instruction: Instruction,
): TransactionInstruction {
  return new TransactionInstruction({
    programId: new PublicKey(instruction.programAddress),
    keys: (instruction.accounts || []).map((account) => ({
      pubkey: new PublicKey(account.address),
      isSigner: isSignerRole(account.role),
      isWritable: isWritableRole(account.role),
    })),
    data: Buffer.from(copyInstructionBytes(instruction.data || new Uint8Array())),
  });
}

export async function buildCreateProfileInstruction(input: {
  owner: string | Address;
  payoutWallet: string | Address;
  username: string;
  metadataUri: string;
  metadataHash: Uint8Array;
}): Promise<TransactionInstruction> {
  const config = getProtocolConfig();
  const owner = address(input.owner);
  const instruction = await getCreateProfileInstructionAsync(
    {
      owner: createNoopSigner(owner),
      payoutWallet: address(input.payoutWallet),
      username: input.username,
      metadataUri: input.metadataUri,
      metadataHash: input.metadataHash,
    },
    { programAddress: config.programAddress },
  );
  return toWeb3Instruction(instruction);
}

export async function buildUpdateProfileInstruction(input: {
  owner: string | Address;
  payoutWallet: string | Address;
  metadataUri: string;
  metadataHash: Uint8Array;
  active: boolean;
}): Promise<TransactionInstruction> {
  const config = getProtocolConfig();
  const owner = address(input.owner);
  const instruction = await getUpdateProfileInstructionAsync(
    {
      owner: createNoopSigner(owner),
      payoutWallet: address(input.payoutWallet),
      metadataUri: input.metadataUri,
      metadataHash: input.metadataHash,
      active: input.active,
    },
    { programAddress: config.programAddress },
  );
  return toWeb3Instruction(instruction);
}

export function buildTipInstruction(input: {
  supporter: string | Address;
  profile: string | Address;
  payoutWallet: string | Address;
  amount: bigint;
  reference: Uint8Array;
}): TransactionInstruction {
  const config = getProtocolConfig();
  const supporter = address(input.supporter);
  return toWeb3Instruction(
    getTipInstruction(
      {
        supporter: createNoopSigner(supporter),
        profile: address(input.profile),
        payoutWallet: address(input.payoutWallet),
        amount: input.amount,
        reference: input.reference,
      },
      { programAddress: config.programAddress },
    ),
  );
}

export async function simulateAndSendProtocolTransaction(input: {
  connection: Connection;
  sendTransaction: WalletTransactionSender;
  feePayer: PublicKey;
  instructions: TransactionInstruction[];
}): Promise<SentProtocolTransaction> {
  const latest =
    await input.connection.getLatestBlockhashAndContext("confirmed");
  const transaction = new Transaction({
    feePayer: input.feePayer,
    blockhash: latest.value.blockhash,
    lastValidBlockHeight: latest.value.lastValidBlockHeight,
  }).add(...input.instructions);

  const simulation = await input.connection.simulateTransaction(transaction);
  if (simulation.value.err) {
    throw new ProtocolSimulationError(simulation.value.logs || []);
  }

  const signature = await input.sendTransaction(transaction, input.connection, {
    minContextSlot: latest.context.slot,
    preflightCommitment: "confirmed",
    maxRetries: 3,
    skipPreflight: false,
  });

  const confirmation = await Promise.race([
    input.connection
      .confirmTransaction(
        {
          signature,
          blockhash: latest.value.blockhash,
          lastValidBlockHeight: latest.value.lastValidBlockHeight,
        },
        "confirmed",
      )
      .catch(() => null),
    new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), CONFIRMATION_TIMEOUT_MS),
    ),
  ]);

  if (confirmation?.value.err) {
    throw new ProtocolTransactionError(signature);
  }

  return {
    signature,
    status: confirmation ? "confirmed" : "submitted",
    unitsConsumed: simulation.value.unitsConsumed ?? null,
  };
}
