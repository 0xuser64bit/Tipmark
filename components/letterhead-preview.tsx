"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Github, Instagram, Linkedin, Twitter } from "lucide-react";
import { BRAND_DOMAIN } from "@/lib/brand";

const ICONS = [
  { key: "x", Icon: Twitter },
  { key: "instagram", Icon: Instagram },
  { key: "github", Icon: Github },
  { key: "linkedin", Icon: Linkedin },
] as const;

/**
 * A truthful, scaled-down copy of the real page — same plate, same type,
 * same order. A preview that looks like a different component teaches the
 * creator nothing.
 */
export function LetterheadPreview({
  coverImage,
  profileImage,
  displayName,
  handle,
  description,
  socials,
}: {
  coverImage: string;
  profileImage: string;
  displayName: string;
  handle: string;
  description: string;
  socials: Record<"x" | "instagram" | "github" | "linkedin", string>;
}) {
  const shown = ICONS.filter(({ key }) => socials[key]?.trim());

  return (
    <div
      aria-hidden
      className="pointer-events-none select-none overflow-hidden rounded-[6px] border border-rule bg-paper"
    >
      {/* Chrome, so the preview reads as a page and not a card */}
      <div className="flex items-center gap-1.5 border-b border-rule bg-well px-3 py-2">
        <span className="size-[7px] rounded-full bg-rule-strong" />
        <span className="size-[7px] rounded-full bg-rule-strong" />
        <span className="size-[7px] rounded-full bg-rule-strong" />
        <span className="figure ml-2 truncate text-[10px] text-ink-faint">
          {BRAND_DOMAIN}/{handle}
        </span>
      </div>

      <div className="px-4 pb-5">
        {/* Plate */}
        <div className="relative mt-4">
          <div className="h-16 overflow-hidden rounded-[4px] border border-rule bg-well">
            {coverImage ? (
              <img src={coverImage} alt="" className="size-full object-cover" />
            ) : (
              <div className="engraved size-full" />
            )}
          </div>
          <div className="absolute -bottom-5 left-3 size-[44px] overflow-hidden rounded-[3px] border-2 border-paper bg-well">
            {profileImage ? (
              <img
                src={profileImage}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-ink font-serif text-lg text-paper">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Identity */}
        <div className="mt-8">
          <p className="truncate font-serif text-[20px] font-medium leading-tight tracking-[-0.02em]">
            {displayName}
          </p>
          <p className="figure mt-1 text-[11px] text-ink-faint">@{handle}</p>
        </div>

        {description && (
          <div className="prose-ledger prose-ledger-sm mt-3 line-clamp-4 text-[12.5px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {description}
            </ReactMarkdown>
          </div>
        )}

        {shown.length > 0 && (
          <div className="mt-4 flex items-center gap-3 border-t border-rule pt-3">
            {shown.map(({ key, Icon }) => (
              <Icon key={key} className="size-[13px] text-ink-faint" />
            ))}
          </div>
        )}

        {/* The ask */}
        <div className="mt-4 rounded-[4px] border border-rule bg-sheet">
          <div className="flex items-center justify-between border-b border-rule px-3 py-2">
            <span className="text-[11px] font-semibold">Send support</span>
            <span className="field-label">SOL</span>
          </div>
          <div className="flex divide-x divide-rule">
            {["0.01", "0.05", "0.25", "1"].map((v, i) => (
              <span
                key={v}
                className={`figure flex-1 py-1.5 text-center text-[10px] ${
                  i === 1 ? "bg-ink text-paper" : "text-ink-faint"
                }`}
              >
                {v}
              </span>
            ))}
          </div>
          <div className="px-3 py-2.5">
            <div className="rounded-[3px] bg-stamp py-1.5 text-center text-[10px] font-medium text-stamp-ink">
              Send 0.05 SOL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
