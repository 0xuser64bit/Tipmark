"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { LogoMark } from "@/components/ui/logo";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "motion/react";

interface UserCardProps {
  name: string;
  username: string;
  imageUrl: string;
  profileUrl: string;
}

export default function UserCard({
  name,
  username,
  imageUrl,
  profileUrl,
}: UserCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card
      data-card-container
      className="relative w-full overflow-hidden rounded-2xl border-white/5 bg-[linear-gradient(140deg,#14101f_0%,#0e0c16_45%,#0c1714_100%)] text-zinc-100 shadow-[0_0_40px_-12px_rgba(153,69,255,0.35)]"
    >
      <div
        data-grid-overlay
        className="absolute inset-0 z-[2] bg-grid opacity-50"
        aria-hidden="true"
      />

      <CardContent className="relative z-10 flex justify-between gap-4 p-6">
        <div className="flex flex-col">
          <div className="mb-4 flex items-center gap-2 text-xs text-zinc-400">
            <LogoMark className="h-6 w-6 rounded-md" />
            <span className="font-semibold tracking-tight text-zinc-200">
              DAOnation
            </span>
          </div>

          <Avatar className="mb-4 h-24 w-24 border border-white/10 bg-zinc-900">
            <AvatarImage src={imageUrl} alt={name} crossOrigin="anonymous" />
            <AvatarFallback className="bg-gradient-to-br from-zinc-800 to-zinc-900 text-2xl font-bold text-brand-muted">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <h2 className="text-2xl font-semibold tracking-tight text-white">
            {name}
          </h2>
          <p className="font-mono text-sm text-zinc-400">@{username}</p>
        </div>

        <div className="flex flex-col items-end justify-between gap-3">
          {mounted && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
              <QRCodeSVG
                value={profileUrl}
                size={120}
                bgColor="rgba(0,0,0,0)"
                fgColor="#14f195"
                level="M"
              />
            </div>
          )}
          <p className="font-mono text-xs text-zinc-400">
            daonation.xyz/{username}
          </p>
        </div>
      </CardContent>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 animate-gradient-shift bg-[linear-gradient(90deg,#9945ff,#14f195,#9945ff)]"
        aria-hidden="true"
      />
    </Card>
  );
}
