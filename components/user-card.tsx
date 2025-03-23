"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";

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
      className="w-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-indigo-900 text-zinc-100 overflow-hidden relative rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.15)]"
    >
      <div
        data-grid-overlay
        className="absolute inset-0 bg-grid-white/[0.03] bg-[size:20px_20px] z-[2]"
        aria-hidden="true"
      />
      <CardContent className="relative flex justify-between z-10 p-6">
        <div className="flex flex-col mb-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative mb-5"
          >
            <Avatar className="h-28 w-28 border-zinc-800 bg-zinc-900 relative">
              <AvatarImage src={imageUrl} alt={name} crossOrigin="anonymous" />
              <AvatarFallback className="bg-gradient-to-br from-zinc-800 to-zinc-900 text-indigo-400 text-2xl font-bold">
                {name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          <div className="relative">
            <motion.h2
              className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {name}
            </motion.h2>
            <motion.p
              className="text-zinc-400"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              @{username}
            </motion.p>
          </div>
        </div>

        <div className="flex flex-col gap-y-4 items-end">
          <div className="text-center">
            <motion.p
              className="text-xs text-zinc-400 mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-indigo-400 transition-colors"
              >
                daonation.xyz/{username}
              </a>
            </motion.p>

            {mounted && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="p-2 bg-zinc-800/30 rounded-md border border-indigo-900/30 shadow-inner"
              >
                <QRCodeSVG
                  value={profileUrl}
                  size={150}
                  bgColor="rgba(0,0,0,0)"
                  fgColor="#818cf8"
                  level="L"
                  className="drop-shadow-md"
                />
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>

      <div
        className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-[length:200%_200%] animate-gradient-shift"
        aria-hidden="true"
      />
    </Card>
  );
}
