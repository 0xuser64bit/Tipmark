import { readFile } from "node:fs/promises";
import { PublicKey } from "@solana/web3.js";

function required(name) {
  const value = process.env[name]?.trim();
  if (!value)
    throw new Error(`${name} is required for a protocol release check`);
  return value;
}

function publicKey(name) {
  try {
    return new PublicKey(required(name));
  } catch {
    throw new Error(`${name} must be a valid Solana public key`);
  }
}

const cluster = required("TIPMARK_RELEASE_CLUSTER");
if (cluster !== "devnet") throw new Error("release checks must target devnet");

const program = publicKey("TIPMARK_PROGRAM_ADDRESS");
const upgradeAuthority = publicKey("TIPMARK_UPGRADE_AUTHORITY");
const multisig = publicKey("TIPMARK_MULTISIG_ADDRESS");
const threshold = Number.parseInt(required("TIPMARK_MULTISIG_THRESHOLD"), 10);
const signers = required("TIPMARK_MULTISIG_SIGNERS")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean)
  .map((value) => new PublicKey(value));

if (!Number.isSafeInteger(threshold) || threshold < 2) {
  throw new Error("multisig threshold must be at least 2");
}
if (threshold > signers.length || signers.length < 2) {
  throw new Error("multisig threshold and signer list are inconsistent");
}
if (
  signers.some((signer, index) =>
    signers.some(
      (other, otherIndex) => index !== otherIndex && signer.equals(other),
    ),
  )
) {
  throw new Error("multisig signer list must not contain duplicates");
}
if (upgradeAuthority.equals(program)) {
  throw new Error("upgrade authority must not equal the program address");
}

const anchor = await readFile("Anchor.toml", "utf8");
if (!anchor.includes(program.toBase58())) {
  throw new Error("program address does not match Anchor.toml");
}
const idl = JSON.parse(await readFile("idls/tipmark_protocol.json", "utf8"));
if (idl.address !== program.toBase58()) {
  throw new Error("program address does not match the generated IDL");
}

console.log(
  JSON.stringify({
    cluster,
    program: program.toBase58(),
    upgradeAuthority: upgradeAuthority.toBase58(),
    multisig: multisig.toBase58(),
    threshold,
    signerCount: signers.length,
  }),
);
