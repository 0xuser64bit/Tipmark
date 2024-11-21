"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, ExternalLink, PartyPopperIcon as Party } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export const CheckExplorerPage = () => {
  const params = useParams();
  const { signature } = params;
  const [explorerUrl, setExplorerUrl] = useState("");

  useEffect(() => {
    setExplorerUrl(` https://solscan.io/tx/${signature}?cluster=devnet`);
  }, [signature]);

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-800 border-zinc-700 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient"></div>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-indigo-400 flex items-center justify-center">
            <Party className="mr-2 h-6 w-6 animate-bounce" />
            Woohoo! Transaction Confirmed
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-4">
            <Image
              src="/kitten-cute.gif"
              alt="Celebration GIF"
              width={200}
              height={200}
              className="rounded-full mx-auto object-cover"
            />
          </div>
          <p className="text-zinc-300 mb-4 animate-pulse">
            Your awesome support has been zapped to the creator! 🚀✨
          </p>
          <div className="bg-zinc-900 p-4 rounded-md overflow-hidden">
            <p className="text-sm font-mono text-indigo-300 break-all">
              {signature}
            </p>
          </div>
          <p className="mt-4 text-sm text-zinc-400">
            This magical string is your transaction signature. It's like a
            digital high-five! 🖐️
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href={explorerUrl} target="_blank" rel="noopener noreferrer">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition duration-300 ease-in-out transform hover:scale-110 hover:rotate-3 flex items-center">
              Peek at the Blockchain Magic
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CheckExplorerPage;