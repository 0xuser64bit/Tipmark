"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "motion/react";
import html2canvas from "html2canvas";
import { Download, QrCode } from "lucide-react";
import { useRef, useState } from "react";
import UserCard from "./user-card";

export const GetCard = ({
  name,
  username,
  profileUrl,
  imageUrl,
}: {
  name: string;
  username: string;
  profileUrl: string;
  imageUrl: string;
}) => {
  const userCardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!userCardRef.current) return;
    setIsDownloading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 250));

      const canvas = await html2canvas(userCardRef.current, {
        backgroundColor: null,
        useCORS: true,
        scale: 3,
        logging: false,
        allowTaint: true,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector(
            "[data-card-container]",
          );
          if (clonedElement) {
            const gridOverlay = clonedElement.querySelector(
              "[data-grid-overlay]",
            );
            if (gridOverlay) gridOverlay.remove();
            const nameElement = clonedElement.querySelector("h2");
            if (nameElement) nameElement.classList.add("download-text");
          }
        },
      });
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = image;
      link.download = `${username}-daonation-card.png`;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <QrCode className="h-4 w-4" />
          Share card
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md border-border bg-popover">
        <DialogTitle className="text-center">Your DAOnation card</DialogTitle>
        <DialogDescription className="text-center">
          Download it and share your link anywhere.
        </DialogDescription>

        <motion.div
          ref={userCardRef}
          className="mx-auto w-full max-w-[420px]"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <UserCard
            name={name}
            username={username}
            imageUrl={imageUrl}
            profileUrl={profileUrl}
          />
        </motion.div>

        <Button
          variant="brand"
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full"
        >
          <Download className="h-4 w-4" />
          {isDownloading ? "Preparing…" : "Download card"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
