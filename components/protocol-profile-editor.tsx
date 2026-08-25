"use client";

import cacheProtocolProfile from "@/actions/cacheProtocolProfile";
import { BRAND_DOMAIN, BRAND_NAME } from "@/lib/brand";
import {
  createIrysClient,
  fundIrysUpload,
  profileImageTags,
  profileMetadataTags,
  quoteIrysUpload,
  uploadPermanentImage,
  uploadPermanentMetadata,
} from "@/lib/protocol/irys";
import {
  canonicalizeProfileMetadata,
  normalizeProfileMetadata,
} from "@/lib/protocol/metadata";
import { getProtocolConfig } from "@/lib/protocol/config";
import { deriveProfilePda, deriveUsernamePda } from "@/lib/protocol/pdas";
import {
  buildCreateProfileInstruction,
  buildUpdateProfileInstruction,
  simulateAndSendProtocolTransaction,
} from "@/lib/protocol/transactions";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { MessageSignerWalletAdapter } from "@solana/wallet-adapter-base";
import { PublicKey } from "@solana/web3.js";
import {
  Github,
  Instagram,
  Linkedin,
  Trash2,
  Twitter,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { AccountMenu } from "./account-menu";
import { LetterheadPreview } from "./letterhead-preview";
import { SiteHeader } from "./site-header";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { WalletTrigger } from "./ui/wallet-button";
import { useWalletConnect } from "./wallet-adapter-wrapper";

type InitialProfile = {
  username: string;
  displayName: string;
  description: string;
  coverImage: string;
  profileImage: string;
  solana: string;
  x: string;
  instagram: string;
  github: string;
  linkedin: string;
  updates: boolean;
};

export interface ProtocolProfileEditorProps {
  email: string;
  initial: InitialProfile;
  mode: "setup" | "edit";
}

const HANDLE = /^[a-z0-9-]{2,30}$/;
const SOLANA_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function permanentUri(value: string): string {
  return /^(?:ar|ipfs):\/\/[^\s/]+$/i.test(value) ? value : "";
}

function previewUri(value: string): string {
  try {
    return /^(?:ar|ipfs):\/\//i.test(value)
      ? new URL(
          value
            .replace(/^ar:\/\//i, "https://arweave.net/")
            .replace(/^ipfs:\/\//i, "https://ipfs.io/ipfs/"),
        ).toString()
      : value;
  } catch {
    return "";
  }
}

export default function ProtocolProfileEditor({
  email,
  initial,
  mode,
}: ProtocolProfileEditorProps) {
  const router = useRouter();
  const { connection } = useConnection();
  const { publicKey, sendTransaction, wallet } = useWallet();
  const { requestConnect } = useWalletConnect();
  const [form, setForm] = useState(() => ({
    ...initial,
    profileImage: permanentUri(initial.profileImage),
    coverImage: permanentUri(initial.coverImage),
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"profile" | "cover" | null>(null);
  const [checkingHandle, setCheckingHandle] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [previewBio, setPreviewBio] = useState(false);
  const handle = form.username.trim().toLowerCase().replace(/\s+/g, "-");

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (
      !HANDLE.test(handle) ||
      (mode === "edit" && handle === initial.username) ||
      !connection
    ) {
      setHandleAvailable(
        mode === "edit" && handle === initial.username ? true : null,
      );
      return;
    }
    let cancelled = false;
    setCheckingHandle(true);
    void deriveUsernamePda(handle)
      .then(([pda]) => connection.getAccountInfo(new PublicKey(pda)))
      .then((account) => {
        if (!cancelled) setHandleAvailable(!account);
      })
      .catch(() => {
        if (!cancelled) setHandleAvailable(null);
      })
      .finally(() => {
        if (!cancelled) setCheckingHandle(false);
      });
    return () => {
      cancelled = true;
    };
  }, [connection, handle, initial.username, mode]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!HANDLE.test(handle))
      next.username = "Use 2–30 lowercase letters, numbers, or dashes.";
    if (mode === "edit" && handle !== initial.username)
      next.username = "A claimed handle cannot be renamed.";
    if (handleAvailable === false)
      next.username = "That handle is already claimed on Solana.";
    if (handleAvailable === null && handle !== initial.username)
      next.username = "Could not verify this handle on Solana.";
    if (!form.displayName.trim())
      next.displayName = "Add the name you want to be paid under.";
    if (!SOLANA_ADDRESS.test(form.solana.trim()))
      next.solana = "Enter a valid Solana payout address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const upload = async (file: File | undefined, kind: "profile" | "cover") => {
    if (!file) return;
    if (!publicKey || !wallet?.adapter) {
      requestConnect();
      return;
    }
    setUploading(kind);
    try {
      const irys = await createIrysClient(
        wallet.adapter as MessageSignerWalletAdapter,
      );
      const uploadKind = kind === "profile" ? "avatar" : "cover";
      const quote = await quoteIrysUpload(irys, [
        {
          bytes: file.size,
          tags: profileImageTags(publicKey.toBase58(), uploadKind),
        },
      ]);
      await fundIrysUpload(irys, quote.fundingRequiredAtomic);
      const uri = await uploadPermanentImage(
        irys,
        file,
        publicKey.toBase58(),
        uploadKind,
      );
      set(kind === "profile" ? "profileImage" : "coverImage", uri);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The upload failed.",
      );
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    if (!validate()) return;
    if (!publicKey || !wallet?.adapter || !connection) {
      requestConnect();
      return;
    }
    setSaving(true);
    try {
      const metadata = normalizeProfileMetadata({
        displayName: form.displayName,
        bio: form.description,
        avatarUri: form.profileImage,
        coverUri: form.coverImage,
        x: form.x,
        instagram: form.instagram,
        github: form.github,
        linkedin: form.linkedin,
      });
      const irys = await createIrysClient(
        wallet.adapter as MessageSignerWalletAdapter,
      );
      const body = canonicalizeProfileMetadata(metadata);
      const quote = await quoteIrysUpload(irys, [
        {
          bytes: new TextEncoder().encode(body).byteLength,
          tags: profileMetadataTags(publicKey.toBase58()),
        },
      ]);
      await fundIrysUpload(irys, quote.fundingRequiredAtomic);
      const uploaded = await uploadPermanentMetadata(
        irys,
        metadata,
        publicKey.toBase58(),
      );

      const [profilePda] = await deriveProfilePda(publicKey.toBase58());
      const profileKey = new PublicKey(profilePda);
      const profileAccount = await connection.getAccountInfo(profileKey);
      if (
        profileAccount &&
        !profileAccount.owner.equals(
          new PublicKey(getProtocolConfig().programAddress),
        )
      ) {
        throw new Error("The profile PDA is owned by an unexpected program.");
      }
      const instruction = profileAccount
        ? await buildUpdateProfileInstruction({
            owner: publicKey.toBase58(),
            payoutWallet: form.solana.trim(),
            metadataUri: uploaded.metadataUri,
            metadataHash: uploaded.metadataHash,
            active: true,
          })
        : await buildCreateProfileInstruction({
            owner: publicKey.toBase58(),
            payoutWallet: form.solana.trim(),
            username: handle,
            metadataUri: uploaded.metadataUri,
            metadataHash: uploaded.metadataHash,
          });
      const result = await simulateAndSendProtocolTransaction({
        connection,
        sendTransaction,
        feePayer: publicKey,
        instructions: [instruction],
      });
      if (result.status !== "confirmed") {
        toast.warning("Submitted to Solana; confirmation is still pending.");
        return;
      }
      try {
        await cacheProtocolProfile({
          email,
          username: handle,
          profile_image: metadata.images.avatar || "",
          cover_image: metadata.images.cover || "",
          display_name: metadata.displayName,
          description: metadata.bio,
          x_username: metadata.links.x || "",
          instagram_username: metadata.links.instagram || "",
          github_username: metadata.links.github || "",
          linkedin_username: metadata.links.linkedin || "",
          solana_public_key: form.solana.trim(),
        });
      } catch {
        toast.warning(
          "Published on Solana; the dashboard cache will catch up.",
        );
      }
      toast.success(
        mode === "setup"
          ? "Your page is live on Solana."
          : "Changes saved on Solana.",
      );
      router.push("/home");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "That did not save.",
      );
    } finally {
      setSaving(false);
    }
  };

  const socials = [
    ["x", "x.com/", <Twitter key="x" />],
    ["instagram", "instagram.com/", <Instagram key="instagram" />],
    ["github", "github.com/", <Github key="github" />],
    ["linkedin", "linkedin.com/in/", <Linkedin key="linkedin" />],
  ] as const;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        nav={mode === "edit"}
        actions={
          <div className="flex items-center gap-2">
            <WalletTrigger />
            <AccountMenu />
          </div>
        }
      />
      <main
        id="main"
        className="mx-auto w-full max-w-[1120px] flex-1 px-5 pb-28 sm:px-8"
      >
        <header className="border-b border-rule py-8">
          <h1 className="text-[clamp(1.75rem,4vw,2.35rem)] font-medium">
            {mode === "setup" ? "Set up your page" : "Edit your page"}
          </h1>
          <p className="mt-2 max-w-[52ch] text-[14px] leading-relaxed text-ink-faint">
            Your wallet owns the profile and permanent metadata. PostgreSQL is
            only a cache.
          </p>
        </header>
        <div className="grid grid-cols-1 items-start gap-10 pt-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
          <div className="max-w-[560px] space-y-8">
            <section className="space-y-5">
              <Field
                label="Handle"
                htmlFor="protocol-handle"
                error={errors.username}
                hint={
                  handleAvailable === true
                    ? `${BRAND_DOMAIN}/${handle} is available on Solana.`
                    : checkingHandle
                      ? "Checking Solana…"
                      : "A claimed handle cannot be renamed."
                }
              >
                <div className="flex">
                  <span className="figure inline-flex items-center rounded-l-[4px] border border-r-0 border-rule bg-well-deep px-3 text-[13px] text-ink-faint">
                    {BRAND_DOMAIN}/
                  </span>
                  <Input
                    id="protocol-handle"
                    value={form.username}
                    disabled={mode === "edit"}
                    onChange={(event) => set("username", event.target.value)}
                    className="figure rounded-l-none"
                  />
                </div>
              </Field>
              <Field
                label="Display name"
                htmlFor="protocol-name"
                error={errors.displayName}
              >
                <Input
                  id="protocol-name"
                  value={form.displayName}
                  onChange={(event) => set("displayName", event.target.value)}
                />
              </Field>
              <Field
                label="Payout wallet"
                htmlFor="protocol-solana"
                error={errors.solana}
                hint="The connected wallet owns this profile; SOL can be paid to any system wallet you control."
              >
                <Input
                  id="protocol-solana"
                  value={form.solana}
                  onChange={(event) => set("solana", event.target.value)}
                  className="figure text-[13px]"
                />
              </Field>
            </section>
            <section className="space-y-5 border-t border-rule pt-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <ProtocolImagePicker
                  label="Profile photo"
                  value={previewUri(form.profileImage)}
                  busy={uploading === "profile"}
                  aspect="square"
                  fallback={(form.displayName || "?").charAt(0).toUpperCase()}
                  onPick={(file) => upload(file, "profile")}
                  onClear={() => set("profileImage", "")}
                />
                <ProtocolImagePicker
                  label="Cover"
                  value={previewUri(form.coverImage)}
                  busy={uploading === "cover"}
                  aspect="wide"
                  onPick={(file) => upload(file, "cover")}
                  onClear={() => set("coverImage", "")}
                />
              </div>
              <Field
                label="About you"
                htmlFor="protocol-bio"
                optional
                aside={
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="field-label"
                      onClick={() => setPreviewBio(false)}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      className="field-label"
                      onClick={() => setPreviewBio(true)}
                    >
                      Preview
                    </button>
                  </div>
                }
              >
                {previewBio ? (
                  <div className="prose-ledger prose-ledger-sm min-h-[112px] rounded-[4px] border border-rule bg-sheet p-3.5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {form.description || "_Nothing written yet._"}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <Textarea
                    id="protocol-bio"
                    value={form.description}
                    onChange={(event) => set("description", event.target.value)}
                  />
                )}
              </Field>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {socials.map(([key, prefix, icon]) => (
                  <ProtocolSocialField
                    key={key}
                    icon={icon}
                    prefix={prefix}
                    value={form[key]}
                    onChange={(value) => set(key, value)}
                  />
                ))}
              </div>
              <label className="flex cursor-pointer items-start gap-2.5 pt-1">
                <Checkbox
                  checked={form.updates}
                  onCheckedChange={(value) => set("updates", Boolean(value))}
                />
                <span className="text-[13px] leading-snug text-ink-soft">
                  Email me when {BRAND_NAME} ships something.
                </span>
              </label>
            </section>
            <div className="flex items-center justify-end border-t border-rule pt-6">
              <Button
                variant="primary"
                onClick={save}
                loading={saving}
                loadingText="Publishing…"
              >
                {mode === "setup" ? "Publish my page" : "Save changes"}
              </Button>
            </div>
          </div>
          <div className="hidden lg:sticky lg:top-8 lg:block">
            <p className="field-label mb-3">Live preview</p>
            <LetterheadPreview
              coverImage={previewUri(form.coverImage)}
              profileImage={previewUri(form.profileImage)}
              displayName={form.displayName || "Your name"}
              handle={handle || "your-name"}
              description={form.description}
              socials={{
                x: form.x,
                instagram: form.instagram,
                github: form.github,
                linkedin: form.linkedin,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function ProtocolSocialField({
  icon,
  prefix,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  prefix: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex">
      <span
        className="inline-flex w-9 shrink-0 items-center justify-center rounded-l-[4px] border border-r-0 border-rule bg-well-deep text-ink-faint [&_svg]:size-[15px]"
        aria-hidden
      >
        {icon}
      </span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={prefix}
        aria-label={prefix}
        className="rounded-l-none text-[13px]"
      />
    </div>
  );
}

function ProtocolImagePicker({
  label,
  value,
  busy,
  aspect,
  onPick,
  onClear,
  fallback,
}: {
  label: string;
  value: string;
  busy: boolean;
  aspect: "square" | "wide";
  onPick: (file?: File) => void;
  onClear: () => void;
  fallback?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className={aspect === "square" ? "max-w-[148px]" : ""}>
      <Label>{label}</Label>
      <div
        className={`mt-2 overflow-hidden rounded-[4px] border border-rule bg-well ${aspect === "square" ? "aspect-square" : "aspect-[16/7]"}`}
      >
        {value ? (
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center bg-ink font-serif text-4xl text-paper">
            {fallback || "?"}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-1">
        <Button
          type="button"
          variant="quiet"
          size="xs"
          loading={busy}
          onClick={() => input.current?.click()}
        >
          <Upload aria-hidden />
          {value ? "Replace" : "Upload"}
        </Button>
        {value && !busy && (
          <Button
            type="button"
            variant="quiet"
            size="xs"
            onClick={onClear}
            aria-label={`Remove ${label.toLowerCase()}`}
          >
            <Trash2 aria-hidden />
          </Button>
        )}
        <span className="figure ml-auto text-[10px] text-ink-ghost">
          ≤ 1 MB
        </span>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          onPick(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
