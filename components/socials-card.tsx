import { Github, Instagram, Linkedin, Twitter } from "lucide-react";

const clean = (v: string) => (v && v.trim() !== "#" ? v.trim() : "");

export const SocialsCard = ({
  x_username,
  instagram_username,
  github_username,
  linkedin_username,
}: {
  x_username: string;
  instagram_username: string;
  github_username: string;
  linkedin_username: string;
}) => {
  const socials = [
    { value: clean(x_username), base: "https://x.com/", icon: Twitter, label: "X" },
    {
      value: clean(instagram_username),
      base: "https://instagram.com/",
      icon: Instagram,
      label: "Instagram",
    },
    {
      value: clean(github_username),
      base: "https://github.com/",
      icon: Github,
      label: "GitHub",
    },
    {
      value: clean(linkedin_username),
      base: "https://linkedin.com/in/",
      icon: Linkedin,
      label: "LinkedIn",
    },
  ].filter((s) => s.value);

  if (socials.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {socials.map(({ value, base, icon: Icon, label }) => (
        <a
          key={label}
          href={value.startsWith("http") ? value : base + value}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="group inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-muted-foreground transition-all duration-150 hover:border-border-emphasis hover:bg-surface-2 hover:text-foreground active:scale-[0.98]"
        >
          <Icon className="h-3.5 w-3.5" />
          <span>{label}</span>
        </a>
      ))}
    </div>
  );
};
