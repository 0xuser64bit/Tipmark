"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import { getProfileByOwner } from "@/actions/getProfileByOwner";
import type { CreatorProfileView } from "@/lib/protocol/profile-view";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { WalletTrigger } from "./ui/wallet-button";
import { useWalletConnect } from "./wallet-adapter-wrapper";

type Resolution =
  | { phase: "waiting" }
  | { phase: "resolving" }
  | { phase: "found"; profile: CreatorProfileView }
  | { phase: "unclaimed" }
  | { phase: "unavailable"; message: string };

/**
 * Resolve the connected wallet's profile from Solana.
 *
 * There is no session: the profile PDA is seeded by owner, so the connected
 * wallet is both the identity and the lookup key. Disconnecting is signing
 * out, and nothing about a creator is remembered between visits.
 */
function useOwnedProfile() {
  const { publicKey } = useWallet();
  const owner = publicKey?.toBase58() ?? null;
  const [resolution, setResolution] = useState<Resolution>({
    phase: "waiting",
  });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  useEffect(() => {
    if (!owner) {
      setResolution({ phase: "waiting" });
      return;
    }

    let cancelled = false;
    setResolution({ phase: "resolving" });

    getProfileByOwner(owner)
      .catch(() => ({
        status: "unavailable" as const,
        message: "Solana could not be reached. Try again shortly.",
      }))
      .then((result) => {
        if (cancelled) return;
        if (result.status === "found") {
          setResolution({ phase: "found", profile: result.profile });
        } else if (result.status === "unclaimed") {
          setResolution({ phase: "unclaimed" });
        } else {
          setResolution({ phase: "unavailable", message: result.message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [owner, attempt]);

  return { owner, resolution, retry };
}

interface GateProps {
  /** Show the creator navigation in gate states that belong behind it. */
  nav?: boolean;
}

/**
 * A screen that cannot render without a claimed profile — the ledger and the
 * owner's view of their own public page.
 */
export function RequireProfile({
  nav = false,
  unclaimed,
  children,
}: GateProps & {
  unclaimed: React.ReactNode;
  children: (profile: CreatorProfileView, owner: string) => React.ReactNode;
}) {
  const { owner, resolution, retry } = useOwnedProfile();

  if (!owner) return <ConnectPrompt />;
  if (resolution.phase === "waiting" || resolution.phase === "resolving") {
    return <Resolving nav={nav} />;
  }
  if (resolution.phase === "unavailable") {
    return (
      <Unavailable nav={nav} message={resolution.message} onRetry={retry} />
    );
  }
  if (resolution.phase === "unclaimed")
    return <Shell nav={false}>{unclaimed}</Shell>;

  return <>{children(resolution.profile, owner)}</>;
}

/**
 * A screen that works from a bare wallet, because its job is to create the
 * profile that does not exist yet.
 */
export function RequireWallet({
  nav = false,
  children,
}: GateProps & {
  children: (
    profile: CreatorProfileView | null,
    owner: string,
  ) => React.ReactNode;
}) {
  const { owner, resolution, retry } = useOwnedProfile();

  if (!owner) return <ConnectPrompt />;
  if (resolution.phase === "waiting" || resolution.phase === "resolving") {
    return <Resolving nav={nav} />;
  }
  if (resolution.phase === "unavailable") {
    return (
      <Unavailable nav={nav} message={resolution.message} onRetry={retry} />
    );
  }

  return (
    <>
      {children(
        resolution.phase === "found" ? resolution.profile : null,
        owner,
      )}
    </>
  );
}

function ConnectPrompt() {
  const { requestConnect } = useWalletConnect();
  const { connecting } = useWallet();

  return (
    <Shell nav={false}>
      <p className="field-label">Your wallet is your account</p>
      <h1 className="mt-4 max-w-[24ch] text-[clamp(1.9rem,4.6vw,2.75rem)] font-medium leading-[1.05]">
        Connect the wallet that owns your page.
      </h1>
      <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-ink-faint">
        There is no password and no account to recover — the wallet holding your
        profile is the only thing that can change it. Connecting is a read;
        nothing is signed until you publish.
      </p>
      <div className="mt-9">
        <Button variant="primary" onClick={requestConnect} loading={connecting}>
          Connect wallet
        </Button>
      </div>
    </Shell>
  );
}

function Resolving({ nav }: { nav: boolean }) {
  return (
    <Shell nav={nav} busy>
      <Skeleton className="h-2.5 w-24" />
      <Skeleton className="mt-4 h-[52px] w-[320px] max-w-full" />
      <Skeleton className="mt-6 h-4 w-full max-w-[46ch]" />
      <Skeleton className="mt-2.5 h-4 w-full max-w-[38ch]" />
    </Shell>
  );
}

function Unavailable({
  nav,
  message,
  onRetry,
}: {
  nav: boolean;
  message: string;
  onRetry: () => void;
}) {
  return (
    <Shell nav={nav}>
      <p className="field-label">Unavailable</p>
      <h1 className="mt-4 max-w-[24ch] text-[clamp(1.9rem,4.6vw,2.75rem)] font-medium leading-[1.05]">
        We could not verify your page.
      </h1>
      <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-ink-faint">
        {message} Your profile and any support you have received live on Solana,
        so nothing here can alter them.
      </p>
      <div className="mt-9">
        <Button variant="ink" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </Shell>
  );
}

/** The framing every gate state shares, so the header never disappears. */
function Shell({
  nav,
  busy = false,
  children,
}: {
  nav: boolean;
  busy?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader nav={nav} actions={<WalletTrigger />} />
      <main
        id="main"
        aria-busy={busy || undefined}
        className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col justify-center px-5 py-20 sm:px-8"
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
