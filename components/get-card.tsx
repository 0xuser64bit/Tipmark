"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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

  const handleDownload = async () => {
    if (userCardRef.current) {
      setIsDownloading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const canvas = await html2canvas(userCardRef.current, {
          backgroundColor: null,
          useCORS: true,
          scale: 2,
          logging: false,
          allowTaint: true,
          onclone: async (clonedDoc) => {
            const clonedElement = await clonedDoc.querySelector(
              "[data-card-container]"
            );
            if (clonedElement) {
              const gridOverlay = await clonedElement.querySelector(
                "[data-grid-overlay]"
              );
              if (gridOverlay) {
                gridOverlay.remove();
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
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 hover:text-white"
        >
          Get Card
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-transparent border-0 [&>button]:hidden">
        <DialogTitle className="sr-only">Get your card</DialogTitle>
        <Download
          role="button"
          onClick={handleDownload}
          className={`h-4 w-4 text-white ml-auto mr-6 cursor-pointer ${
            isDownloading ? "opacity-50" : ""
          }`}
          aria-label="Download card"
          aria-disabled={isDownloading}
        />
        <div ref={userCardRef} className="w-full max-w-md mx-auto">
          <UserCard
            name={name}
            username={username}
            imageUrl={imageUrl}
            profileUrl={profileUrl}
          />
        </div>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
