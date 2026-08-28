import { describe, expect, test } from "bun:test";
import {
  NonRetryableRpcReadError,
  withRpcReadFailoverFromEndpoints,
} from "./rpc";

describe("Solana RPC read failover", () => {
  test("retries a transient endpoint before moving to the next", async () => {
    const calls: string[] = [];
    const value = await withRpcReadFailoverFromEndpoints(
      ["https://primary.example", "https://secondary.example"],
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
        ["https://primary.example", "https://secondary.example"],
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
        ["https://primary.example", "https://secondary.example"],
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
