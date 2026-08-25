"use client";

import { checkUsernameAvailable } from "@/actions/checkUsername";
import UpdateUserProfileAction from "@/actions/updateUserProfile";
import { useEdgeStore } from "@/lib/edgestore";
import { cn } from "@/lib/utils";
import { BRAND_DOMAIN, BRAND_NAME } from "@/lib/brand";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Github,
  Instagram,
  Linkedin,
  Loader2,
  Trash2,
  Twitter,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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

/* ── Types ──────────────────────────────────────────────────────────── */

export interface ProfileEditorProps {
  email: string;
  initial: {
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
  /** Setup runs as a wizard; a finished page edits as a single form. */
  mode: "setup" | "edit";
}

type HandleState = "idle" | "checking" | "free" | "taken" | "invalid";

const SOLANA_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const HANDLE = /^[a-z0-9-]{2,30}$/;

const STEPS = [
  { n: 1, title: "Your link" },
  { n: 2, title: "Your wallet" },
  { n: 3, title: "Your page" },
] as const;

/* ── Editor ─────────────────────────────────────────────────────────── */

export default function ProfileEditor({
  email,
  initial,
  mode,
}: ProfileEditorProps) {
  const router = useRouter();
  const { edgestore } = useEdgeStore();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<"cover" | "profile" | null>(null);
  const [previewBio, setPreviewBio] = useState(false);
  const [handleState, setHandleState] = useState<HandleState>("idle");

  const [form, setForm] = useState(initial);
  const set = useCallback(
    <K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) => {
      setForm((f) => ({ ...f, [key]: value }));
      setDirty(true);
    },
    [],
  );

  const handle = form.username.trim().toLowerCase().replace(/\s+/g, "-");

  /* Availability, debounced. The creator's own handle counts as free. */
  useEffect(() => {
    if (!handle) return setHandleState("idle");
    if (!HANDLE.test(handle)) return setHandleState("invalid");
    if (handle === initial.username) return setHandleState("free");

    setHandleState("checking");
    const t = setTimeout(async () => {
      const res = await checkUsernameAvailable(handle);
      setHandleState(
        res.available ? "free" : res.reason === "invalid" ? "invalid" : "taken",
      );
    }, 400);
    return () => clearTimeout(t);
  }, [handle, initial.username]);

  const upload = async (file: File | undefined, kind: "cover" | "profile") => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("That file isn't an image.");
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error("Images need to be under 1 MB.");
      return;
    }
    setUploading(kind);
    const key = kind === "cover" ? "coverImage" : "profileImage";
    try {
      const reader = new FileReader();
      reader.onload = (e) => set(key, e.target?.result as string);
      reader.readAsDataURL(file);
      const res = await edgestore.publicFiles.upload({ file });
      set(key, res.url);
    } catch {
      toast.error("The upload failed. Try again.");
      set(key, initial[key]);
    } finally {
      setUploading(null);
    }
  };

  /* ── Validation ───────────────────────────────────────────────────── */

  const validate = (which: 1 | 2 | "all") => {
    const e: Record<string, string> = {};
    if (which === 1 || which === "all") {
      if (!handle) e.username = "Pick a handle for your link.";
      else if (handleState === "invalid")
        e.username = "2–30 characters: lowercase letters, numbers, dashes.";
      else if (handleState === "taken") e.username = "Someone has that one.";
      if (!form.displayName.trim())
        e.displayName = "Add the name you want to be paid under.";
    }
    if (which === 2 || which === "all") {
      const addr = form.solana.trim();
      if (!addr) e.solana = "Add the wallet you want the SOL to land in.";
      else if (!SOLANA_ADDRESS.test(addr))
        e.solana =
          "That isn't a Solana address — check for a missing character.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate("all")) {
      if (errors.username || errors.displayName) setStep(1);
      else setStep(2);
      return;
    }
    setSaving(true);
    try {
      const { statusCode } = await UpdateUserProfileAction({
        username: handle,
        display_name: form.displayName.trim(),
        description: form.description.trim(),
        profile_image: form.profileImage,
        cover_image: form.coverImage,
        x_username: form.x.trim(),
        instagram_username: form.instagram.trim(),
        github_username: form.github.trim(),
        linkedin_username: form.linkedin.trim(),
        blockchainKeys: { solana: form.solana.trim() },
        updates: form.updates,
        email,
      });

      if (statusCode === 200) {
        setDirty(false);
        toast.success(
          mode === "setup" ? "Your page is live." : "Changes saved.",
        );
        router.push("/home");
      } else if (statusCode === 409) {
        setHandleState("taken");
        setErrors({ username: "Someone claimed that handle just now." });
        setStep(1);
      } else {
        toast.error("That didn't save. Try again.");
      }
    } catch {
      toast.error("That didn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    if (validate(step as 1 | 2)) setStep((s) => Math.min(3, s + 1));
  };

  const wizard = mode === "setup";
  const showing = (n: number) => !wizard || step === n;

  /* ── Sections ─────────────────────────────────────────────────────── */

  const linkSection = (
    <Section
      title="Your link"
      note="This is what you share. It can be changed later, but old links stop working."
      hidden={!showing(1)}
      showTitle={!wizard}
    >
      <Field
        label="Handle"
        htmlFor="handle"
        error={errors.username}
        hint={
          handleState === "free" && handle
            ? `${BRAND_DOMAIN}/${handle} is yours.`
            : "Lowercase letters, numbers and dashes."
        }
      >
        <div className="flex">
          <span className="figure inline-flex items-center rounded-l-[4px] border border-r-0 border-rule bg-well-deep px-3 text-[13px] text-ink-faint">
            {BRAND_DOMAIN}/
          </span>
          <div className="relative flex-1">
            <Input
              id="handle"
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              placeholder="your-name"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={Boolean(errors.username)}
              className="figure rounded-l-none pr-9"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <HandleState state={handleState} />
            </span>
          </div>
        </div>
      </Field>

      <Field label="Display name" htmlFor="name" error={errors.displayName}>
        <Input
          id="name"
          value={form.displayName}
          onChange={(e) => set("displayName", e.target.value)}
          placeholder="Ada Lovelace"
          aria-invalid={Boolean(errors.displayName)}
        />
      </Field>
    </Section>
  );

  const walletSection = (
    <Section
      title="Your wallet"
      note="Contributions go straight here. We never hold them, and we can't move them."
      hidden={!showing(2)}
      showTitle={!wizard}
    >
      <Field
        label="Solana address"
        htmlFor="solana"
        error={errors.solana}
        hint="Your public address — the one starting with letters and numbers. Never a seed phrase or private key."
      >
        <Input
          id="solana"
          value={form.solana}
          onChange={(e) => set("solana", e.target.value)}
          placeholder="7Xk4…"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={Boolean(errors.solana)}
          className="figure text-[13px]"
        />
      </Field>
    </Section>
  );

  const pageSection = (
    <Section
      title="Your page"
      note="All optional. A photo and two sentences roughly double the odds someone contributes."
      hidden={!showing(3)}
      showTitle={!wizard}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <ImagePicker
          label="Profile photo"
          value={form.profileImage}
          busy={uploading === "profile"}
          aspect="square"
          fallback={(form.displayName || "?").charAt(0).toUpperCase()}
          onPick={(f) => upload(f, "profile")}
          onClear={() => set("profileImage", "")}
        />
        <ImagePicker
          label="Cover"
          value={form.coverImage}
          busy={uploading === "cover"}
          aspect="wide"
          onPick={(f) => upload(f, "cover")}
          onClear={() => set("coverImage", "")}
        />
      </div>

      <Field
        label="About you"
        htmlFor="bio"
        optional
        hint="Markdown works. Say what the support pays for."
        aside={
          <div className="flex gap-3">
            <TinyToggle
              active={!previewBio}
              onClick={() => setPreviewBio(false)}
            >
              Write
            </TinyToggle>
            <TinyToggle active={previewBio} onClick={() => setPreviewBio(true)}>
              Preview
            </TinyToggle>
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
            id="bio"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="I maintain an open-source library that a few thousand people depend on. Support keeps it patched."
          />
        )}
      </Field>

      <div className="space-y-2.5">
        <Label>Elsewhere</Label>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <SocialField
            icon={<Twitter />}
            prefix="x.com/"
            value={form.x}
            onChange={(v) => set("x", v)}
          />
          <SocialField
            icon={<Instagram />}
            prefix="instagram.com/"
            value={form.instagram}
            onChange={(v) => set("instagram", v)}
          />
          <SocialField
            icon={<Github />}
            prefix="github.com/"
            value={form.github}
            onChange={(v) => set("github", v)}
          />
          <SocialField
            icon={<Linkedin />}
            prefix="linkedin.com/in/"
            value={form.linkedin}
            onChange={(v) => set("linkedin", v)}
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 pt-1">
        <Checkbox
          className="mt-px"
          checked={form.updates}
          onCheckedChange={(v) => set("updates", Boolean(v))}
        />
        <span className="text-[13px] leading-snug text-ink-soft">
          Email me when {BRAND_NAME} ships something. Rarely, and never your
          address.
        </span>
      </label>
    </Section>
  );

  /* ── Frame ────────────────────────────────────────────────────────── */

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader nav={mode === "edit"} actions={<AccountMenu />} />

      <main
        id="main"
        className="mx-auto w-full max-w-[1120px] flex-1 px-5 pb-28 sm:px-8"
      >
        <header className="border-b border-rule py-8">
          <h1 className="text-[clamp(1.75rem,4vw,2.35rem)] font-medium">
            {wizard ? "Set up your page" : "Edit your page"}
          </h1>
          <p className="mt-2 max-w-[52ch] text-[14px] leading-relaxed text-ink-faint">
            {wizard
              ? "Three things and people can start sending you SOL. It takes about a minute."
              : "Changes go live the moment you save."}
          </p>
        </header>

        {wizard && (
          <ol className="flex flex-wrap border-b border-rule">
            {STEPS.map(({ n, title }) => {
              const done = n < step;
              const active = n === step;
              return (
                <li key={n}>
                  <button
                    type="button"
                    disabled={n > step}
                    onClick={() => n < step && setStep(n)}
                    className={cn(
                      "-mb-px flex items-center gap-2 border-b-2 px-1 py-3.5 pr-6 text-[13.5px] transition-colors",
                      active
                        ? "border-ink font-medium text-ink"
                        : done
                          ? "border-transparent text-ink-faint hover:text-ink"
                          : "border-transparent text-ink-ghost",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-[18px] shrink-0 items-center justify-center rounded-full border font-mono text-[10px]",
                        active
                          ? "border-ink bg-ink text-paper"
                          : done
                            ? "border-stamp bg-stamp text-stamp-ink"
                            : "border-rule-strong text-ink-ghost",
                      )}
                    >
                      {done ? (
                        <Check className="size-2.5" strokeWidth={3} />
                      ) : (
                        n
                      )}
                    </span>
                    {title}
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        <div className="grid grid-cols-1 items-start gap-10 pt-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
          <div className={wizard ? "" : "divide-y divide-rule"}>
            {linkSection}
            {walletSection}
            {pageSection}

            {/* Actions. In edit mode the container's own divider already
                closes the last section, so no extra rule here. */}
            <div
              className={cn(
                "flex max-w-[560px] items-center justify-between gap-3",
                wizard ? "mt-8 border-t border-rule pt-6" : "py-6",
              )}
            >
              {wizard ? (
                <>
                  <Button
                    variant="quiet"
                    onClick={() => setStep((s) => Math.max(1, s - 1))}
                    className={cn(step === 1 && "invisible")}
                  >
                    <ArrowLeft aria-hidden />
                    Back
                  </Button>
                  {step < 3 ? (
                    <Button variant="ink" onClick={next}>
                      Continue
                      <ArrowRight aria-hidden />
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={save}
                      loading={saving}
                      loadingText="Publishing…"
                    >
                      Publish my page
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <p className="text-[12.5px] text-ink-faint">
                    {dirty ? "Unsaved changes." : "Everything is saved."}
                  </p>
                  <Button
                    variant={dirty ? "primary" : "outline"}
                    onClick={save}
                    loading={saving}
                    loadingText="Saving…"
                    disabled={!dirty}
                  >
                    Save changes
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Live preview */}
          <div className="hidden lg:sticky lg:top-8 lg:block">
            <p className="field-label mb-3">Live preview</p>
            <LetterheadPreview
              coverImage={form.coverImage}
              profileImage={form.profileImage}
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

/* ── Pieces ─────────────────────────────────────────────────────────── */

function Section({
  title,
  note,
  hidden,
  /** In the wizard the stepper already names the step, so the heading is
      suppressed rather than printed twice. */
  showTitle = true,
  children,
}: {
  title: string;
  note: string;
  hidden?: boolean;
  showTitle?: boolean;
  children: React.ReactNode;
}) {
  if (hidden) return null;
  return (
    <section
      className={cn("max-w-[560px]", showTitle ? "py-8 first:pt-0" : "pb-2")}
    >
      <div className="mb-6">
        {showTitle && (
          <h2 className="font-sans text-[15px] font-semibold tracking-[-0.005em]">
            {title}
          </h2>
        )}
        <p
          className={cn(
            "text-[13px] leading-relaxed text-ink-faint",
            showTitle && "mt-1.5",
          )}
        >
          {note}
        </p>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function HandleState({ state }: { state: HandleState }) {
  if (state === "checking")
    return <Loader2 className="size-4 animate-spin text-ink-ghost" />;
  if (state === "free") return <Check className="size-4 text-stamp" />;
  if (state === "taken" || state === "invalid")
    return <X className="size-4 text-seal" />;
  return null;
}

function TinyToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "field-label border-b transition-colors",
        active
          ? "border-ink text-ink"
          : "border-transparent hover:text-ink-soft",
      )}
    >
      {children}
    </button>
  );
}

function SocialField({
  icon,
  prefix,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  prefix: string;
  value: string;
  onChange: (v: string) => void;
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
        onChange={(e) => onChange(e.target.value)}
        placeholder={prefix}
        aria-label={prefix}
        autoComplete="off"
        spellCheck={false}
        className="rounded-l-none text-[13px]"
      />
    </div>
  );
}

function ImagePicker({
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
    <div className={cn(aspect === "square" && "max-w-[148px]")}>
      <Label>{label}</Label>
      <div
        className={cn(
          "mt-2 overflow-hidden rounded-[4px] border border-rule bg-well",
          aspect === "square" ? "aspect-square" : "aspect-[16/7]",
        )}
      >
        {value ? (
          <img src={value} alt="" className="size-full object-cover" />
        ) : aspect === "wide" ? (
          <div aria-hidden className="engraved size-full" />
        ) : (
          <div
            aria-hidden
            className="flex size-full items-center justify-center bg-ink font-serif text-4xl text-paper"
          >
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
          loadingText="Uploading…"
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
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
