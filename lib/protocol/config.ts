import {
  address,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  devnet,
  mainnet,
  testnet,
  type Address,
} from "@solana/kit";
import { TIPMARK_PROTOCOL_PROGRAM_ADDRESS } from "@/clients/tipmark-protocol/src";
import {
  getSolanaNetworkConfig,
  type SolanaCluster,
} from "@/lib/solana/cluster";

export type TipmarkCluster = SolanaCluster;

export interface TipmarkProtocolRuntimeConfig {
  enabled: boolean;
  cluster: TipmarkCluster;
  programAddress: Address;
  rpcUrl: string;
  websocketUrl: string;
}

export function getProtocolConfig(): TipmarkProtocolRuntimeConfig {
  const network = getSolanaNetworkConfig();
  const configuredProgram = process.env.NEXT_PUBLIC_TIPMARK_PROGRAM_ID?.trim();
  const configuredRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim();
  const configuredWebsocket = process.env.NEXT_PUBLIC_SOLANA_WS_URL?.trim();

  return {
    enabled: process.env.NEXT_PUBLIC_TIPMARK_PROTOCOL_ENABLED === "true",
    cluster: network.cluster,
    programAddress: address(
      configuredProgram || TIPMARK_PROTOCOL_PROGRAM_ADDRESS,
    ),
    rpcUrl: configuredRpc || network.rpcUrl,
    websocketUrl: configuredWebsocket || network.websocketUrl,
  };
}

export function createProtocolRpc(config = getProtocolConfig()) {
  if (config.cluster === "devnet") {
    return createSolanaRpc(devnet(config.rpcUrl));
  }
  if (config.cluster === "testnet") {
    return createSolanaRpc(testnet(config.rpcUrl));
  }
  if (config.cluster === "mainnet-beta") {
    return createSolanaRpc(mainnet(config.rpcUrl));
  }
  return createSolanaRpc(config.rpcUrl);
}

export function createProtocolSubscriptions(config = getProtocolConfig()) {
  if (config.cluster === "devnet") {
    return createSolanaRpcSubscriptions(devnet(config.websocketUrl));
  }
  if (config.cluster === "testnet") {
    return createSolanaRpcSubscriptions(testnet(config.websocketUrl));
  }
  if (config.cluster === "mainnet-beta") {
    return createSolanaRpcSubscriptions(mainnet(config.websocketUrl));
  }
  return createSolanaRpcSubscriptions(config.websocketUrl);
}
