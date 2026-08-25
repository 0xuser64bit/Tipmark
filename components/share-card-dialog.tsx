"use client";

import html2canvas from "html2canvas";
import { Download, QrCode } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ShareCard } from "./share-card";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export function ShareCardDialog({
  name,
  username,
  profileUrl,
  imageUrl,
}: {
  name: string;
  username: string;
  profileUrl: string;
  imageUrl: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
        scale: 3,
        logging: false,
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png", 1);
      link.download = `daonation-${username}.png`;
      link.click();
    } catch {
      toast.error("Couldn't build the image. Try again in a moment.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode aria-hidden />
          Share card
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Your share card</DialogTitle>
          <DialogDescription>
            A PNG for your bio, stories, or the end of a video. The QR opens
            your page.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div ref={cardRef}>
            <ShareCard
              name={name}
              username={username}
              imageUrl={imageUrl}
              profileUrl={profileUrl}
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="ink"
            block
            onClick={download}
            loading={downloading}
            loadingText="Rendering…"
          >
            <Download aria-hidden />
            Download PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
