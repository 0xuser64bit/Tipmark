"use client";

import { Github, Instagram, Linkedin, Twitter } from "lucide-react";

const clean = (v?: string) => (v && v.trim() !== "#" ? v.trim() : "");

const NETWORKS = [
  { key: "x", base: "https://x.com/", icon: Twitter, label: "X" },
  {
    key: "instagram",
    base: "https://instagram.com/",
    icon: Instagram,
    label: "Instagram",
  },
  { key: "github", base: "https://github.com/", icon: Github, label: "GitHub" },
  {
    key: "linkedin",
    base: "https://linkedin.com/in/",
    icon: Linkedin,
    label: "LinkedIn",
  },
] as const;

/**
 * Social links are a quiet run of text at the foot of the letterhead —
 * a line of references, not a row of buttons competing with the one action
 * that matters on this page.
 */
export function SocialLinks({
  handles,
}: {
  handles: Partial<Record<(typeof NETWORKS)[number]["key"], string>>;
}) {
  const links = NETWORKS.map((n) => ({ ...n, value: clean(handles[n.key]) })).filter(
    (n) => n.value,
  );

  if (links.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {links.map(({ value, base, icon: Icon, label, key }) => (
        <li key={key}>
          <a
            href={value.startsWith("http") ? value : base + value}
            target="_blank"
            rel="noopener noreferrer me"
            className="group inline-flex items-center gap-2 text-[13px] text-ink-faint transition-colors hover:text-ink"
          >
            <Icon className="size-[15px]" aria-hidden />
            <span className="underline decoration-rule-strong decoration-1 underline-offset-[3px] transition-colors group-hover:decoration-ink-faint">
              {label}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
