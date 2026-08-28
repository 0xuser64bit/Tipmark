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
  /** The write and wallet endpoint. Never failed over. */
  rpcUrl: string;
  /** Ordered read endpoints, `rpcUrl` first. */
  rpcUrls: string[];
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

  const rpcUrl = configuredRpc || network.rpcUrl;

  return {
    cluster: network.cluster,
    programAddress: address(
      configuredProgram || TIPMARK_PROTOCOL_PROGRAM_ADDRESS,
    ),
    rpcUrl,
    rpcUrls: [rpcUrl, ...network.rpcUrls.filter((url) => url !== rpcUrl)],
  };
}

/** A Kit RPC client for one endpoint, cluster-tagged where Kit wants it. */
export function createProtocolRpcForEndpoint(
  endpoint: string,
  cluster: TipmarkCluster,
) {
  return cluster === "devnet"
    ? createSolanaRpc(devnet(endpoint))
    : createSolanaRpc(endpoint);
}

export function createProtocolRpc(config = getProtocolConfig()) {
  return createProtocolRpcForEndpoint(config.rpcUrl, config.cluster);
}
