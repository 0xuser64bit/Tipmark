"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { LogoMark } from "./ui/logo";
import { BRAND_DOMAIN } from "@/lib/brand";

/**
 * The share card is the one printed artefact a creator takes off the
 * platform, so it is the one place the design earns a flourish: banknote
 * line-work, a tear line, and a QR that is actually high-contrast enough
 * to scan from a phone screen.
 *
 * Colours are written as literal hex here on purpose — html2canvas cannot
 * rasterise `color-mix()`, which is what Tailwind's opacity modifiers
 * compile to.
 */
export function ShareCard({
  name,
  username,
  imageUrl,
  profileUrl,
}: {
  name: string;
  username: string;
  imageUrl: string;
  profileUrl: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      data-share-card
      className="engraved relative w-full overflow-hidden rounded-[6px] border"
      style={{ backgroundColor: "#ffffff", borderColor: "#cdc5b4" }}
    >
      {/* Masthead */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid #e2ddd1" }}
      >
        <span className="inline-flex items-baseline gap-2">
          <LogoMark className="translate-y-[3px]" />
          <span className="inline-flex items-baseline">
            <span
              className="font-mono text-[11px] font-medium uppercase tracking-[0.02em]"
              style={{ color: "#17150f" }}
            >
              TIP
            </span>
            <span
              className="font-serif text-[15px] font-medium leading-none tracking-[-0.02em]"
              style={{ color: "#17150f" }}
            >
              mark
            </span>
          </span>
        </span>
        <span
          className="font-mono text-[9px] font-medium uppercase tracking-[0.14em]"
          style={{ color: "#8c8474" }}
        >
          Support in SOL
        </span>
      </div>

      {/* Body */}
      <div className="flex items-start justify-between gap-5 px-5 pb-4 pt-5">
        <div className="min-w-0 flex-1">
          <div
            className="mb-4 size-[58px] overflow-hidden rounded-[4px]"
            style={{ border: "1px solid #e2ddd1", backgroundColor: "#f2efe8" }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                crossOrigin="anonymous"
                className="size-full object-cover"
              />
            ) : (
              <div
                className="flex size-full items-center justify-center font-serif text-2xl"
                style={{ backgroundColor: "#17150f", color: "#faf8f4" }}
              >
                {name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
          </div>

          <p
            className="truncate font-serif text-[26px] font-medium leading-tight tracking-[-0.02em]"
            style={{ color: "#17150f" }}
          >
            {name}
          </p>
          <p
            className="mt-0.5 font-mono text-[12px]"
            style={{ color: "#8c8474" }}
          >
            @{username}
          </p>
        </div>

        {mounted && (
          <div
            className="shrink-0 rounded-[4px] p-2"
            style={{ border: "1px solid #e2ddd1", backgroundColor: "#ffffff" }}
          >
            <QRCodeSVG
              value={profileUrl}
              size={104}
              bgColor="#ffffff"
              fgColor="#17150f"
              level="M"
            />
          </div>
        )}
      </div>

      {/* Tear line + the link */}
      <div style={{ borderTop: "1px dashed #cdc5b4" }}>
        <p
          className="px-5 py-3 font-mono text-[12px] tracking-[-0.01em]"
          style={{ color: "#14573c" }}
        >
          {BRAND_DOMAIN}/{username}
        </p>
      </div>
    </div>
  );
}
