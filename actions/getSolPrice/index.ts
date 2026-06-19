/**
 * Fetches the current SOL → USD price. Cached for 60s at the data layer.
 * Returns null on any failure so callers degrade gracefully (hide USD
 * rather than crash the money flow).
 */
export async function getSolPrice(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { solana?: { usd?: number } };
    const usd = data?.solana?.usd;
    return typeof usd === "number" && Number.isFinite(usd) ? usd : null;
  } catch {
    return null;
  }
}
