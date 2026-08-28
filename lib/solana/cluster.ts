import { clusterApiUrl } from "@solana/web3.js";

export type SolanaCluster = "localnet" | "devnet" | "testnet" | "mainnet-beta";

const DEFAULT_RPC_URLS: Record<SolanaCluster, string> = {
  localnet: "http://127.0.0.1:8899",
  devnet: clusterApiUrl("devnet"),
  testnet: clusterApiUrl("testnet"),
  "mainnet-beta": clusterApiUrl("mainnet-beta"),
};

export interface SolanaNetworkConfig {
  cluster: SolanaCluster;
  label: string;
  rpcUrl: string;
  rpcUrls: string[];
}

export function parseSolanaCluster(value: string | undefined): SolanaCluster {
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

export function getSolanaNetworkConfig(): SolanaNetworkConfig {
  const cluster = parseSolanaCluster(process.env.NEXT_PUBLIC_SOLANA_CLUSTER);
  const rpcUrl =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim() || DEFAULT_RPC_URLS[cluster];
  const rpcUrls = [
    rpcUrl,
    ...(process.env.NEXT_PUBLIC_SOLANA_RPC_URLS || "")
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean),
  ].filter((url, index, urls) => urls.indexOf(url) === index);

  return {
    cluster,
    label: cluster === "mainnet-beta" ? "Solana mainnet" : `Solana ${cluster}`,
    rpcUrl,
    rpcUrls,
  };
}

export function getSolscanTransactionUrl(
  signature: string,
  config = getSolanaNetworkConfig(),
): string {
  const base = `https://solscan.io/tx/${signature}`;
  if (config.cluster === "mainnet-beta") return base;
  if (config.cluster === "localnet") {
    return `https://explorer.solana.com/tx/${signature}?cluster=custom&customUrl=${encodeURIComponent(config.rpcUrl)}`;
  }
  return `${base}?cluster=${config.cluster}`;
}
