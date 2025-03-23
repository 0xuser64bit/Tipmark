"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink, PartyPopperIcon as Party } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Enhanced3DCard } from "./ui/enhanced-card";

export const CheckExplorerCard = ({
  signature,
}: {
  signature: string | string[] | undefined;
}) => {
  const [explorerUrl, setExplorerUrl] = useState("");

  useEffect(() => {
    setExplorerUrl(`https://solscan.io/tx/${signature}`);
  }, [signature]);
  
  return (
    <Enhanced3DCard 
      className="w-full max-w-md p-0 border-0" 
      glowColor="rgba(99, 102, 241, 0.4)"
      hoverScale={1.03}
    >
      <Card className="w-full max-w-md bg-transparent border-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient"></div>
        <CardHeader>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <CardTitle className="text-2xl font-bold text-center text-indigo-400 flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ repeat: Infinity, repeatDelay: 3, duration: 1 }}
              >
                <Party className="mr-2 h-6 w-6" />
              </motion.div>
              Woohoo! Transaction Confirmed
            </CardTitle>
          </motion.div>
        </CardHeader>
        <CardContent className="text-center">
          <motion.div 
            className="mb-4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", bounce: 0.5 }}
          >
            <Image
              src="/kitten-cute.gif"
              alt="Celebration GIF"
              width={200}
              height={200}
              className="rounded-lg mx-auto object-cover"
            />
          </motion.div>
          <motion.p 
            className="text-zinc-300 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Your awesome support has been zapped to the creator! 🚀✨
          </motion.p>
          <motion.div 
            className="bg-zinc-900 p-4 rounded-md overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ 
              boxShadow: "0 0 15px rgba(99, 102, 241, 0.3)",
              scale: 1.01
            }}
          >
            <p className="text-sm font-mono text-indigo-300 break-all">
              {signature}
            </p>
          </motion.div>
          <motion.p 
            className="mt-4 text-sm text-zinc-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            This magical string is your transaction signature. It's like a digital
            high-five! 🖐️
          </motion.p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href={explorerUrl} target="_blank" rel="noopener noreferrer">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition duration-300 ease-in-out flex items-center gap-2">
                Peek at the Blockchain Magic
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </CardFooter>
      </Card>
    </Enhanced3DCard>
  );
};
