"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";

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
      className="w-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-indigo-900 text-zinc-100 overflow-hidden relative"
    >
      <div
        data-grid-overlay
        className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]"
        aria-hidden="true"
      />
      <CardContent className="relative flex justify-between z-10 p-6">
        <div className="flex flex-col mb-4">
          <Avatar className="h-28 w-28 border-2 border-indigo-500 mb-4">
            <AvatarImage src={imageUrl} alt={name} crossOrigin="anonymous" />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold text-indigo-400">{name}</h2>
            <p className="text-zinc-400">@{username}</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-center">
            <p className="text-xs text-zinc-400 mb-1">
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                daonation.xyz/{username}
              </a>
            </p>
            {mounted && (
              <QRCodeSVG
                value={profileUrl}
                size={150}
                bgColor="transparent"
                fgColor="#818cf8"
                level="L"
              />
            )}
          </div>
        </div>
      </CardContent>
      <div
        className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
        aria-hidden="true"
      />
    </Card>
  );
}
