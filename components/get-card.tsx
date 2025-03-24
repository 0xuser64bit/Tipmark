"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDownload = async () => {
    if (userCardRef.current) {
      setIsDownloading(true);
      try {
        // Small delay to ensure flip animation completes
        await new Promise((resolve) => setTimeout(resolve, 800));

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
              clonedElement.classList.add("download-mode");

              // Remove the grid overlay
              const gridOverlay = clonedElement.querySelector(
                "[data-grid-overlay]",
              );
              if (gridOverlay) {
                gridOverlay.remove();
              }

              // Ensure name and text are visible by adding background
              const nameElement = clonedElement.querySelector("h2");
              if (nameElement) {
                nameElement.classList.add("download-text");
              }
            }
          },
        });
        const image = canvas.toDataURL("image/png", 1.0);
        const link = document.createElement("a");
        link.href = image;
        link.download = `${username}-card.png`;
        link.click();
      } catch (error) {
        console.error("Error generating image:", error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 hover:text-white transition-all duration-300 hover:shadow-lg"
        >
          Get Card
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900/80 backdrop-blur-lg border border-zinc-800 rounded-xl [&>button]:text-white max-w-md sm:max-w-lg md:max-w-xl">
        <DialogTitle className="text-white text-center">
          Your DAOnation Card
        </DialogTitle>

        <div className="flex justify-end items-center mb-4">
          <Download
            role="button"
            onClick={handleDownload}
            className={`h-6 w-6 text-white cursor-pointer hover:scale-110 transition-transform ${
              isDownloading ? "opacity-50" : ""
            }`}
            aria-label="Download card"
            aria-disabled={isDownloading}
          />
        </div>

        <motion.div
          ref={userCardRef}
          className="w-full max-w-[440px] mx-auto relative preserve-3d transition-all duration-700 premium-card-effect shadow-2xl card-border-gradient"
          initial={{ rotateY: 0 }}
          animate={{ rotateY: 360 }}
          transition={{ duration: 0.7 }}
        >
          <div className={`w-full backface-hidden rounded-xl overflow-hidden`}>
            <div className="relative">
              <UserCard
                name={name}
                username={username}
                imageUrl={imageUrl}
                profileUrl={profileUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 rounded-xl"></div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
