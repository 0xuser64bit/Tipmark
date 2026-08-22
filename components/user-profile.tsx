"use client";

import UpdateUserProfileAction from "@/actions/updateUserProfile";
import { checkUsernameAvailable } from "@/actions/checkUsername";
import { useEdgeStore } from "@/lib/edgestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { LoadingButton } from "./ui/loading-button";
import { AppNav } from "./app-nav";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Github,
  Instagram,
  Linkedin,
  Loader2,
  Twitter,
  Upload,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface UserProfileProps {
  coverImageValue: string;
  profileImageValue: string;
  usernameValue: string;
  displayNameValue: string;
  descriptionValue: string;
  instagramValue: string;
  linkedinValue: string;
  twitterValue: string;
  githubValue: string;
  solanaPublicKeyValue: string;
  email: string;
  updates: boolean;
}

const clean = (v: string) => (v && v.trim() !== "#" ? v.trim() : "");

const STEPS = [
  { id: 1, title: "Claim handle" },
  { id: 2, title: "Profile details" },
  { id: 3, title: "Wallet & Socials" },
];

type UsernameState = "idle" | "checking" | "available" | "taken" | "invalid";

export default function UserProfile({
  coverImageValue,
  profileImageValue,
  usernameValue,
  displayNameValue,
  descriptionValue,
  instagramValue,
  linkedinValue,
  twitterValue,
  githubValue,
  solanaPublicKeyValue,
  email,
  updates: updatesValue,
}: UserProfileProps) {
  const router = useRouter();
  const { edgestore } = useEdgeStore();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [username, setUsername] = useState(usernameValue || "");
  const [displayName, setDisplayName] = useState(displayNameValue || "");
  const [description, setDescription] = useState(descriptionValue || "");
  const [coverImage, setCoverImage] = useState(
    coverImageValue || "/dummy-cover.png",
  );
  const [profileImage, setProfileImage] = useState(
    profileImageValue || "/sol.png",
  );
  const [solana, setSolana] = useState(solanaPublicKeyValue || "");
  const [x, setX] = useState(clean(twitterValue));
  const [instagram, setInstagram] = useState(clean(instagramValue));
  const [github, setGithub] = useState(clean(githubValue));
  const [linkedin, setLinkedin] = useState(clean(linkedinValue));
  const [updates, setUpdates] = useState(updatesValue);
  const [previewMode, setPreviewMode] = useState(false);

  const [usernameState, setUsernameState] = useState<UsernameState>("idle");
  const [uploading, setUploading] = useState<null | "cover" | "profile">(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const slug = username.trim().split(" ").join("-").toLowerCase();

  // Debounced real-time handle availability
  useEffect(() => {
    if (!slug) {
      setUsernameState("idle");
      return;
    }
    if (!/^[a-z0-9-]{2,30}$/.test(slug)) {
      setUsernameState("invalid");
      return;
    }
    setUsernameState("checking");
    const t = setTimeout(async () => {
      const res = await checkUsernameAvailable(slug);
      setUsernameState(
        res.available
          ? "available"
          : res.reason === "invalid"
            ? "invalid"
            : "taken",
      );
    }, 450);
    return () => clearTimeout(t);
  }, [slug]);

  const handleImageUpload = async (
    file: File | undefined,
    setImage: (v: string) => void,
    kind: "cover" | "profile",
  ) => {
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error("Image must be under 1MB");
      return;
    }
    setUploading(kind);
    try {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
      const res = await edgestore.publicFiles.upload({ file });
      setImage(res.url);
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(null);
    }
  };

  const validateStep = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!slug) e.username = "Pick a handle";
      else if (usernameState === "invalid")
        e.username = "2–30 lowercase letters, numbers, or dashes";
      else if (usernameState === "taken") e.username = "That handle is taken";
      if (!displayName.trim()) e.displayName = "Add a display name";
    }
    if (s === 2 && !description.trim()) e.description = "Add a short bio";
    if (s === 3) {
      if (!solana.trim()) e.solana = "Add your Solana address";
      else if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(solana.trim()))
        e.solana = "That doesn't look like a Solana address";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(3, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handlePublish = async () => {
    if (!validateStep(1)) {
      setStep(1);
      return;
    }
    if (!validateStep(3)) return;
    setIsLoading(true);
    try {
      const { statusCode } = await UpdateUserProfileAction({
        username: slug,
        profile_image: profileImage,
        cover_image: coverImage,
        email,
        display_name: displayName.trim(),
        description: description.trim(),
        x_username: x.trim(),
        instagram_username: instagram.trim(),
        github_username: github.trim(),
        linkedin_username: linkedin.trim(),
        blockchainKeys: { solana: solana.trim() },
        updates,
      });
      if (statusCode === 200) {
        toast.success("Your page is live! 🎉");
        router.push("/home");
      } else if (statusCode === 409) {
        setUsernameState("taken");
        setErrors({ username: "That handle is taken" });
        setStep(1);
      } else {
        toast.error("Couldn't save. Please try again.");
      }
    } catch {
      toast.error("Couldn't save. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav />

      <main className="mx-auto w-full max-w-5xl flex-grow px-4 py-10 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-[-0.03em]">
            Set up your page
          </h1>
          <p className="mt-1 text-muted-foreground">
            Three quick steps and you&apos;re ready to get supported.
          </p>
        </div>

        {/* ── Stepper (Horizontal bar style) ────────────────────── */}
        <div className="mb-10 flex w-full max-w-2xl items-center">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex flex-1 items-center">
              <button
                type="button"
                onClick={() => s.id < step && setStep(s.id)}
                className="group relative flex flex-col gap-2 focus:outline-none"
              >
                <div
                  className={cn(
                    "h-1.5 w-16 rounded-full transition-colors",
                    step >= s.id ? "bg-brand" : "bg-surface-2 group-hover:bg-border-emphasis",
                  )}
                />
                <span
                  className={cn(
                    "text-[11px] font-medium uppercase tracking-widest transition-colors text-left",
                    step >= s.id ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.title}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="mx-4 mb-5 h-px flex-1 bg-border" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
          {/* ── Form ──────────────────────────────────────────────── */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                {step === 1 && (
                  <>
                    <Field
                      label="Handle"
                      error={errors.username}
                      hint="This becomes your shareable link."
                    >
                      <div className="flex items-stretch shadow-sm">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-surface-2 px-3 font-mono text-[13px] text-muted-foreground select-none">
                          daonation.xyz/
                        </span>
                        <div className="relative flex-grow">
                          <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="your-name"
                            className="rounded-l-none border-l-0 pr-9 font-mono shadow-none"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2">
                            <UsernameIndicator state={usernameState} />
                          </span>
                        </div>
                      </div>
                    </Field>
                    <Field label="Display name" error={errors.displayName}>
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Satoshi Nakamoto"
                      />
                    </Field>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div>
                      <Label className="mb-2.5 block">Cover &amp; photo</Label>
                      <div className="relative">
                        <label className="group relative block h-40 w-full cursor-pointer overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-border-emphasis">
                          <img
                            src={coverImage}
                            alt="Cover"
                            className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            {uploading === "cover" ? (
                              <Loader2 className="h-5 w-5 animate-spin text-white" />
                            ) : (
                              <Upload className="h-5 w-5 text-white" />
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageUpload(
                                e.target.files?.[0],
                                setCoverImage,
                                "cover",
                              )
                            }
                          />
                        </label>
                        <label className="group absolute -bottom-8 left-6 block h-24 w-24 cursor-pointer overflow-hidden rounded-2xl border-[3px] border-background bg-surface shadow-md">
                          <img
                            src={profileImage}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            {uploading === "profile" ? (
                              <Loader2 className="h-4 w-4 animate-spin text-white" />
                            ) : (
                              <Upload className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageUpload(
                                e.target.files?.[0],
                                setProfileImage,
                                "profile",
                              )
                            }
                          />
                        </label>
                      </div>
                      <p className="mt-11 text-[11px] text-muted-foreground uppercase tracking-widest">
                        JPG/PNG · Max 1MB
                      </p>
                    </div>

                    <Field label="Bio" error={errors.description}>
                      <div className="mb-2 flex gap-1 rounded-md bg-surface-2 p-1 w-fit border border-border">
                        <button
                          type="button"
                          onClick={() => setPreviewMode(false)}
                          className={cn(
                            "rounded-[4px] px-3 py-1 text-[11px] font-medium uppercase tracking-widest transition-colors",
                            !previewMode
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          Write
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewMode(true)}
                          className={cn(
                            "rounded-[4px] px-3 py-1 text-[11px] font-medium uppercase tracking-widest transition-colors",
                            previewMode
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          Preview
                        </button>
                      </div>
                      {previewMode ? (
                        <div className="markdown min-h-[120px] rounded-md border border-border bg-surface p-4">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {description || "_Nothing here yet._"}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Tell supporters what you're building. Markdown is supported."
                          rows={5}
                        />
                      )}
                    </Field>
                  </>
                )}

                {step === 3 && (
                  <>
                    <Field
                      label="Solana wallet address"
                      error={errors.solana}
                      hint="Support is sent directly here — non-custodial."
                    >
                      <Input
                        value={solana}
                        onChange={(e) => setSolana(e.target.value)}
                        placeholder="Your Solana public key"
                        className="font-mono text-[13px]"
                      />
                    </Field>

                    <div>
                      <Label className="mb-2 block">
                        Social links{" "}
                        <span className="font-normal text-muted-foreground">
                          (optional)
                        </span>
                      </Label>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <SocialInput
                          icon={<Twitter className="h-4 w-4" />}
                          value={x}
                          onChange={setX}
                          placeholder="X username"
                        />
                        <SocialInput
                          icon={<Instagram className="h-4 w-4" />}
                          value={instagram}
                          onChange={setInstagram}
                          placeholder="Instagram username"
                        />
                        <SocialInput
                          icon={<Github className="h-4 w-4" />}
                          value={github}
                          onChange={setGithub}
                          placeholder="GitHub username"
                        />
                        <SocialInput
                          icon={<Linkedin className="h-4 w-4" />}
                          value={linkedin}
                          onChange={setLinkedin}
                          placeholder="LinkedIn username"
                        />
                      </div>
                    </div>

                    <label className="mt-6 flex cursor-pointer items-start gap-3">
                      <Checkbox
                        className="mt-0.5"
                        checked={updates}
                        onCheckedChange={(v) => setUpdates(Boolean(v))}
                      />
                      <span className="text-sm text-muted-foreground">
                        Email me product updates from DAOnation
                      </span>
                    </label>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* ── Actions ───────────────────────────────────────────── */}
            <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
              <Button
                variant="ghost"
                onClick={back}
                disabled={step === 1}
                className={cn(step === 1 && "invisible")}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              {step < 3 ? (
                <Button variant="outline" onClick={next}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <LoadingButton
                  variant="brand"
                  onClick={handlePublish}
                  isLoading={isLoading}
                  loadingText="Publishing…"
                >
                  Publish profile
                </LoadingButton>
              )}
            </div>
          </div>

          {/* ── Live preview ──────────────────────────────────────── */}
          <div className="h-fit lg:sticky lg:top-24">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Live preview
            </p>
            <LivePreview
              coverImage={coverImage}
              profileImage={profileImage}
              displayName={displayName || "Your name"}
              slug={slug || "your-name"}
              description={description}
              socials={{ x, instagram, github, linkedin }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-[13px] text-destructive">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function UsernameIndicator({ state }: { state: UsernameState }) {
  if (state === "checking")
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  if (state === "available") return <Check className="h-4 w-4 text-money" />;
  if (state === "taken" || state === "invalid")
    return <AlertCircle className="h-4 w-4 text-destructive" />;
  return null;
}

function SocialInput({
  icon,
  value,
  onChange,
  placeholder,
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center shadow-sm">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-l-md border border-r-0 border-input bg-surface-2 text-muted-foreground">
        {icon}
      </span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-l-none shadow-none"
      />
    </div>
  );
}

/* ── Polished Preview Card to match live site ───────────────── */
function LivePreview({
  coverImage,
  profileImage,
  displayName,
  slug,
  description,
  socials,
}: {
  coverImage: string;
  profileImage: string;
  displayName: string;
  slug: string;
  description: string;
  socials: { x: string; instagram: string; github: string; linkedin: string };
}) {
  const socialIcons = [
    { v: socials.x, Icon: Twitter },
    { v: socials.instagram, Icon: Instagram },
    { v: socials.github, Icon: Github },
    { v: socials.linkedin, Icon: Linkedin },
  ].filter((s) => s.v);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm pointer-events-none">
      <div className="relative h-[84px] w-full">
        <img src={coverImage} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
      </div>
      <div className="px-5 pb-5">
        <div className="-mt-8 mb-3 h-16 w-16 overflow-hidden rounded-[0.8rem] border-[3px] border-card bg-surface shadow-sm">
          <img
            src={profileImage}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <p className="truncate text-[15px] font-semibold tracking-tight leading-tight">{displayName}</p>
        <p className="font-mono text-[11px] text-muted-foreground mt-0.5">@{slug}</p>
        
        {description && (
          <div className="markdown mt-3 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {description}
            </ReactMarkdown>
          </div>
        )}
        
        {socialIcons.length > 0 && (
          <div className="mt-4 flex gap-1.5">
            {socialIcons.map(({ Icon }, i) => (
              <span
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground"
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-5 rounded-lg border border-border bg-surface p-2.5 flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Support in SOL
          </span>
          <Wallet className="h-3 w-3 text-money" />
        </div>
      </div>
    </div>
  );
}
