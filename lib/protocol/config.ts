import { address, createSolanaRpc, devnet, type Address } from "@solana/kit";
import { TIPMARK_PROTOCOL_PROGRAM_ADDRESS } from "@/clients/tipmark-protocol/src";
import {
  getSolanaNetworkConfig,
  type SolanaCluster,
} from "@/lib/solana/cluster";

export type TipmarkCluster = Extract<SolanaCluster, "devnet" | "localnet">;

export interface TipmarkProtocolRuntimeConfig {
  cluster: TipmarkCluster;
  programAddress: Address;
  rpcUrl: string;
}

/**
 * The protocol is the product; there is no non-protocol mode to fall back to.
 * A misconfigured program address is therefore a deployment error rather than
 * a degraded runtime, and is reported as one.
 *
 * The cluster is narrowed here rather than in `getSolanaNetworkConfig`, which
 * still describes testnet and mainnet so the explorer links and cluster badge
 * can name them. Reaching either from the protocol layer is a code change.
 */
export function getProtocolConfig(): TipmarkProtocolRuntimeConfig {
  const network = getSolanaNetworkConfig();
  const configuredProgram = process.env.NEXT_PUBLIC_TIPMARK_PROGRAM_ID?.trim();
  const configuredRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim();

  if (network.cluster !== "devnet" && network.cluster !== "localnet") {
    throw new Error(
      "Tipmark currently supports the Solana devnet and localnet clusters only.",
    );
  }

  return {
    cluster: network.cluster,
    programAddress: address(
      configuredProgram || TIPMARK_PROTOCOL_PROGRAM_ADDRESS,
    ),
    rpcUrl: configuredRpc || network.rpcUrl,
  };
}

/**
 * Account reads go to the primary endpoint only.
 *
 * `NEXT_PUBLIC_SOLANA_RPC_URLS` covers the signature and transaction reads in
 * `lib/solana/rpc.ts`; it does not cover this path yet. Extending it here would
 * need the same non-retryable-error discipline, because a verification failure
 * must not be retried against another provider.
 */
export function createProtocolRpc(config = getProtocolConfig()) {
  if (config.cluster === "devnet") {
    return createSolanaRpc(devnet(config.rpcUrl));
  }
  return createSolanaRpc(config.rpcUrl);
}
