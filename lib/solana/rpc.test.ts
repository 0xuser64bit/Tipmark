import { describe, expect, test } from "bun:test";
import {
  NonRetryableRpcReadError,
  withEndpointFailover,
  withRpcReadFailoverFromEndpoints,
} from "./rpc";

const ENDPOINTS = ["https://primary.example", "https://secondary.example"];

describe("Solana RPC read failover", () => {
  test("retries a transient endpoint before moving to the next", async () => {
    const calls: string[] = [];
    const value = await withRpcReadFailoverFromEndpoints(
      ENDPOINTS,
      async (_connection, endpoint) => {
        calls.push(endpoint);
        if (endpoint.includes("primary")) throw new Error("network timeout");
        return "ok";
      },
      { attemptsPerEndpoint: 2, retryDelayMs: 0 },
    );
    expect(value).toBe("ok");
    expect(calls).toEqual([
      "https://primary.example",
      "https://primary.example",
      "https://secondary.example",
    ]);
  });

  test("does not fail over deterministic validation errors", async () => {
    const calls: string[] = [];
    await expect(
      withRpcReadFailoverFromEndpoints(
        ENDPOINTS,
        async (_connection, endpoint) => {
          calls.push(endpoint);
          throw new Error("invalid signature");
        },
        { attemptsPerEndpoint: 2, retryDelayMs: 0 },
      ),
    ).rejects.toThrow("invalid signature");
    expect(calls).toEqual(["https://primary.example"]);
  });

  test("does not fail over explicitly non-retryable errors", async () => {
    const calls: string[] = [];
    await expect(
      withRpcReadFailoverFromEndpoints(
        ENDPOINTS,
        async (_connection, endpoint) => {
          calls.push(endpoint);
          throw new NonRetryableRpcReadError("receipt verification failed");
        },
        { attemptsPerEndpoint: 2, retryDelayMs: 0 },
      ),
    ).rejects.toThrow("receipt verification failed");
    expect(calls).toEqual(["https://primary.example"]);
  });
});

describe("transport-agnostic endpoint failover", () => {
  test("builds one client per endpoint, not per attempt", async () => {
    const built: string[] = [];
    const attempts: string[] = [];

    const value = await withEndpointFailover(
      ENDPOINTS,
      (endpoint) => {
        built.push(endpoint);
        return { endpoint };
      },
      async (client: { endpoint: string }) => {
        attempts.push(client.endpoint);
        if (client.endpoint.includes("primary")) {
          throw new Error("connection reset");
        }
        return "ok";
      },
      { attemptsPerEndpoint: 2, retryDelayMs: 0 },
    );

    expect(value).toBe("ok");
    expect(built).toEqual(ENDPOINTS);
    expect(attempts).toEqual([
      "https://primary.example",
      "https://primary.example",
      "https://secondary.example",
    ]);
  });

  test("surfaces the last error when every endpoint fails", async () => {
    await expect(
      withEndpointFailover(
        ENDPOINTS,
        (endpoint) => endpoint,
        async (endpoint: string) => {
          throw new Error(`down: ${endpoint}`);
        },
        { attemptsPerEndpoint: 1, retryDelayMs: 0 },
      ),
    ).rejects.toThrow("down: https://secondary.example");
  });
});
