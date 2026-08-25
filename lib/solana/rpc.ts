import { Connection } from "@solana/web3.js";
import { getSolanaNetworkConfig } from "./cluster";

const DEFAULT_ATTEMPTS_PER_ENDPOINT = 2;
const RETRY_DELAY_MS = 150;

export interface RpcReadOptions {
  attemptsPerEndpoint?: number;
  retryDelayMs?: number;
}

export class NonRetryableRpcReadError extends Error {}

function isRetryable(error: unknown): boolean {
  if (error instanceof NonRetryableRpcReadError) return false;
  if (!(error instanceof Error)) return true;
  return !/invalid|malformed|signature|account|program|metadata/i.test(
    error.message,
  );
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/** Run a read against ordered RPC endpoints without moving transaction writes. */
export async function withRpcReadFailover<T>(
  operation: (connection: Connection, endpoint: string) => Promise<T>,
  options: RpcReadOptions = {},
): Promise<T> {
  return withRpcReadFailoverFromEndpoints(
    getSolanaNetworkConfig().rpcUrls,
    operation,
    options,
  );
}

export async function withRpcReadFailoverFromEndpoints<T>(
  endpoints: readonly string[],
  operation: (connection: Connection, endpoint: string) => Promise<T>,
  options: RpcReadOptions = {},
): Promise<T> {
  const attempts = Math.max(
    1,
    Math.min(options.attemptsPerEndpoint ?? DEFAULT_ATTEMPTS_PER_ENDPOINT, 4),
  );
  const retryDelayMs = Math.max(
    0,
    Math.min(options.retryDelayMs ?? RETRY_DELAY_MS, 2_000),
  );
  let lastError: unknown;

  for (const endpoint of endpoints) {
    const connection = new Connection(endpoint, "confirmed");
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        return await operation(connection, endpoint);
      } catch (error) {
        lastError = error;
        if (!isRetryable(error)) throw error;
        if (attempt + 1 < attempts) await delay(retryDelayMs);
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All configured Solana RPC endpoints failed.");
}

export async function readWithRpcFailover<T>(
  operation: (connection: Connection, endpoint: string) => Promise<T>,
  injectedConnection?: Connection,
  options?: RpcReadOptions,
): Promise<T> {
  if (injectedConnection) {
    return operation(injectedConnection, "injected");
  }
  return withRpcReadFailover(operation, options);
}
