"use server";

import db from "@/db";
import { auth } from "@/lib/auth";
import { BRAND_DOMAIN } from "@/lib/brand";
import { getSolanaNetworkConfig } from "@/lib/solana/cluster";
import {
  decodeWalletAuthorization,
  encodeWalletAuthorization,
  walletAuthorizationCookieName,
  walletAuthorizationMaxAge,
  walletChallengeMessage,
} from "@/lib/protocol/wallet-auth";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import { cookies } from "next/headers";
import { BRAND_URL } from "@/lib/brand";

const CHALLENGE_TTL_MS = 10 * 60 * 1000;

function assertWallet(wallet: string): string {
  try {
    return new PublicKey(wallet).toBase58();
  } catch {
    throw new Error("Invalid Solana wallet address.");
  }
}

function assertUri(uri: string): string {
  const normalized = uri.trim();
  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error("Invalid authorization URI.");
  }
  const configuredOrigin = new URL(process.env.NEXTAUTH_URL || BRAND_URL)
    .origin;
  if (
    !/^https?:$/i.test(parsed.protocol) ||
    parsed.origin !== configuredOrigin ||
    normalized.length > 300
  ) {
    throw new Error("Invalid authorization URI.");
  }
  return normalized;
}

export async function createWalletChallenge(input: {
  wallet: string;
  uri: string;
}) {
  const wallet = assertWallet(input.wallet);
  const uri = assertUri(input.uri);
  const session = await auth();
  const network = getSolanaNetworkConfig();
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + CHALLENGE_TTL_MS);
  const nonce = crypto.randomUUID();
  const challenge = await db.walletChallenge.create({
    data: {
      nonce,
      wallet,
      email: session?.user?.email || null,
      domain: BRAND_DOMAIN,
      uri,
      cluster: network.cluster,
      issuedAt,
      expiresAt,
    },
  });

  return {
    challengeId: challenge.id,
    wallet,
    message: walletChallengeMessage({
      domain: BRAND_DOMAIN,
      uri,
      wallet,
      cluster: network.cluster,
      nonce,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    }),
    expiresAt: expiresAt.toISOString(),
  };
}

export async function verifyWalletChallenge(input: {
  challengeId: string;
  wallet: string;
  signatureBase64: string;
}) {
  const wallet = assertWallet(input.wallet);
  const session = await auth();
  const challenge = await db.walletChallenge.findUnique({
    where: { id: input.challengeId },
  });
  if (!challenge || challenge.wallet !== wallet || challenge.usedAt) {
    throw new Error("This wallet authorization challenge is invalid.");
  }
  if (challenge.expiresAt.getTime() <= Date.now()) {
    throw new Error("This wallet authorization challenge has expired.");
  }
  if (challenge.email && challenge.email !== session?.user?.email) {
    throw new Error("The signed-in account does not own this challenge.");
  }

  const network = getSolanaNetworkConfig();
  if (
    challenge.cluster !== network.cluster ||
    challenge.domain !== BRAND_DOMAIN
  ) {
    throw new Error("This wallet authorization challenge is out of scope.");
  }
  const message = walletChallengeMessage({
    domain: challenge.domain,
    uri: challenge.uri,
    wallet,
    cluster: challenge.cluster,
    nonce: challenge.nonce,
    issuedAt: challenge.issuedAt.toISOString(),
    expiresAt: challenge.expiresAt.toISOString(),
  });
  let signature: Uint8Array;
  try {
    signature = Uint8Array.from(Buffer.from(input.signatureBase64, "base64"));
  } catch {
    throw new Error("Invalid wallet signature encoding.");
  }
  if (
    signature.length !== nacl.sign.signatureLength ||
    !nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      signature,
      new PublicKey(wallet).toBytes(),
    )
  ) {
    throw new Error("The wallet signature could not be verified.");
  }

  const consumed = await db.walletChallenge.updateMany({
    where: {
      id: challenge.id,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { usedAt: new Date() },
  });
  if (consumed.count !== 1) {
    throw new Error("This wallet authorization challenge was already used.");
  }

  const authorization = encodeWalletAuthorization({
    wallet,
    challengeId: challenge.id,
    expiresAt: challenge.expiresAt.getTime(),
  });
  (await cookies()).set(walletAuthorizationCookieName(), authorization, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: walletAuthorizationMaxAge(),
  });

  return { wallet, expiresAt: challenge.expiresAt.toISOString() };
}

export async function getWalletAuthorization() {
  const value = (await cookies()).get(walletAuthorizationCookieName())?.value;
  return decodeWalletAuthorization(value);
}
