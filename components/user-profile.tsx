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
  { id: 1, title: "Claim your handle" },
  { id: 2, title: "Make it yours" },
  { id: 3, title: "Get paid" },
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
    <div className="flex min-h-screen flex-col bg-grid">
      <AppNav />

      <main className="mx-auto w-full max-w-5xl flex-grow px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Set up your page
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Three quick steps and you&apos;re ready to get supported.
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => s.id < step && setStep(s.id)}
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  step > s.id &&
                    "border-money/40 bg-money/15 text-money",
                  step === s.id && "border-brand bg-brand text-white",
                  step < s.id && "border-border bg-surface text-muted-foreground",
                )}
              >
                {step > s.id ? <Check className="h-3.5 w-3.5" /> : s.id}
              </button>
              <span
                className={cn(
                  "hidden text-sm sm:block",
                  step >= s.id ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s.title}
              </span>
              {i < STEPS.length - 1 && (
                <div className="h-px flex-1 bg-border" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          {/* Form */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                {step === 1 && (
                  <>
                    <Field
                      label="Handle"
                      error={errors.username}
                      hint="This becomes your shareable link."
                    >
                      <div className="flex items-stretch">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-surface px-3 font-mono text-sm text-muted-foreground">
                          daonation.xyz/
                        </span>
                        <div className="relative flex-grow">
                          <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="your-name"
                            className="rounded-l-none pr-9 font-mono"
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
                      <Label className="mb-2 block">Cover &amp; photo</Label>
                      <div className="relative">
                        <label className="group relative block h-36 w-full cursor-pointer overflow-hidden rounded-xl border border-border">
                          <img
                            src={coverImage}
                            alt="Cover"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
                            {uploading === "cover" ? (
                              <Loader2 className="h-6 w-6 animate-spin text-white" />
                            ) : (
                              <Upload className="h-6 w-6 text-white" />
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
                        <label className="group absolute -bottom-6 left-4 block h-20 w-20 cursor-pointer overflow-hidden rounded-xl border-4 border-background bg-surface">
                          <img
                            src={profileImage}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
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
                      <p className="mt-8 text-xs text-muted-foreground">
                        PNG or JPG, up to 1MB each.
                      </p>
                    </div>

                    <Field label="Bio" error={errors.description}>
                      <div className="mb-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewMode(false)}
                          className={cn(
                            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                            !previewMode
                              ? "bg-surface-2 text-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          Write
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewMode(true)}
                          className={cn(
                            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                            previewMode
                              ? "bg-surface-2 text-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          Preview
                        </button>
                      </div>
                      {previewMode ? (
                        <div className="markdown min-h-[150px] rounded-md border border-border bg-surface p-4">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {description || "_Nothing here yet._"}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Tell supporters what you're building. Markdown is supported."
                          rows={6}
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
                        className="font-mono text-sm"
                      />
                    </Field>

                    <div>
                      <Label className="mb-2 block">
                        Socials{" "}
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

                    <label className="flex cursor-pointer items-center gap-2.5">
                      <Checkbox
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

            {/* Nav */}
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={back}
                disabled={step === 1}
                className={cn(step === 1 && "invisible")}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              {step < 3 ? (
                <Button variant="brand" onClick={next}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <LoadingButton
                  variant="brand"
                  onClick={handlePublish}
                  isLoading={isLoading}
                  loadingText="Publishing…"
                >
                  <BadgeCheck className="h-4 w-4" /> Publish my page
                </LoadingButton>
              )}
            </div>
          </div>

          {/* Live preview */}
          <div className="h-fit lg:sticky lg:top-20">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
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
    <div className="flex items-center gap-2">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground">
        {icon}
      </span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

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
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative h-20 w-full">
        <img src={coverImage} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
      </div>
      <div className="px-4 pb-4">
        <div className="-mt-7 mb-2 h-14 w-14 overflow-hidden rounded-xl border-4 border-card bg-surface">
          <img
            src={profileImage}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <p className="truncate font-semibold tracking-tight">{displayName}</p>
          <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-money" />
        </div>
        <p className="font-mono text-xs text-muted-foreground">@{slug}</p>
        {description && (
          <div className="markdown mt-3 line-clamp-4 text-xs text-muted-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {description}
            </ReactMarkdown>
          </div>
        )}
        {socialIcons.length > 0 && (
          <div className="mt-3 flex gap-1.5">
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
        <div className="mt-4 rounded-lg border border-border bg-surface-2/40 p-2.5 text-center text-xs text-money">
          Support in SOL
        </div>
      </div>
    </div>
  );
}
