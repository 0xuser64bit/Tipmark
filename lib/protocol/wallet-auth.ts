import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "tipmark_wallet_authorization";
const AUTH_MAX_AGE_SECONDS = 10 * 60;

export interface WalletAuthorization {
  wallet: string;
  challengeId: string;
  expiresAt: number;
}

export function walletChallengeMessage(input: {
  domain: string;
  uri: string;
  wallet: string;
  cluster: string;
  nonce: string;
  issuedAt: string;
  expiresAt: string;
}): string {
  return [
    "Tipmark wallet authorization",
    `Domain: ${input.domain}`,
    `URI: ${input.uri}`,
    `Wallet: ${input.wallet}`,
    `Cluster: ${input.cluster}`,
    `Nonce: ${input.nonce}`,
    `Issued At: ${input.issuedAt}`,
    `Expiration Time: ${input.expiresAt}`,
  ].join("\n");
}

function secret(): string {
  return process.env.NEXTAUTH_SECRET || "development-only-secret";
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function encodeWalletAuthorization(
  authorization: WalletAuthorization,
): string {
  const payload = Buffer.from(JSON.stringify(authorization)).toString(
    "base64url",
  );
  return `${payload}.${sign(payload)}`;
}

export function decodeWalletAuthorization(
  value: string | undefined,
  now = Date.now(),
): WalletAuthorization | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (
    actualBytes.length !== expectedBytes.length ||
    !timingSafeEqual(actualBytes, expectedBytes)
  ) {
    return null;
  }
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<WalletAuthorization>;
    if (
      typeof parsed.wallet !== "string" ||
      typeof parsed.challengeId !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      parsed.expiresAt <= now
    ) {
      return null;
    }
    return {
      wallet: parsed.wallet,
      challengeId: parsed.challengeId,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}

export function walletAuthorizationCookieName(): string {
  return COOKIE_NAME;
}

export function walletAuthorizationMaxAge(): number {
  return AUTH_MAX_AGE_SECONDS;
}
