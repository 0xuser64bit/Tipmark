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

export type TipmarkCluster = "localnet" | "devnet" | "testnet" | "mainnet-beta";

const DEFAULT_HTTP_ENDPOINTS: Record<TipmarkCluster, string> = {
  localnet: "http://127.0.0.1:8899",
  devnet: "https://api.devnet.solana.com",
  testnet: "https://api.testnet.solana.com",
  "mainnet-beta": "https://api.mainnet-beta.solana.com",
};

const DEFAULT_WS_ENDPOINTS: Record<TipmarkCluster, string> = {
  localnet: "ws://127.0.0.1:8900",
  devnet: "wss://api.devnet.solana.com",
  testnet: "wss://api.testnet.solana.com",
  "mainnet-beta": "wss://api.mainnet-beta.solana.com",
};

export interface TipmarkProtocolRuntimeConfig {
  enabled: boolean;
  cluster: TipmarkCluster;
  programAddress: Address;
  rpcUrl: string;
  websocketUrl: string;
}

function parseCluster(value: string | undefined): TipmarkCluster {
  if (
    value === "localnet" ||
    value === "devnet" ||
    value === "testnet" ||
    value === "mainnet-beta"
  ) {
    return value;
  }

  return "devnet";
}

export function getProtocolConfig(): TipmarkProtocolRuntimeConfig {
  const cluster = parseCluster(process.env.NEXT_PUBLIC_SOLANA_CLUSTER);
  const configuredProgram = process.env.NEXT_PUBLIC_TIPMARK_PROGRAM_ID?.trim();
  const configuredRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim();
  const configuredWebsocket = process.env.NEXT_PUBLIC_SOLANA_WS_URL?.trim();

  return {
    enabled: process.env.NEXT_PUBLIC_TIPMARK_PROTOCOL_ENABLED === "true",
    cluster,
    programAddress: address(
      configuredProgram || TIPMARK_PROTOCOL_PROGRAM_ADDRESS,
    ),
    rpcUrl: configuredRpc || DEFAULT_HTTP_ENDPOINTS[cluster],
    websocketUrl: configuredWebsocket || DEFAULT_WS_ENDPOINTS[cluster],
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
