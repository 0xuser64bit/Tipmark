"use client";

import { use, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { Spinner } from "./spinner";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { redirect, useRouter } from "next/navigation";

export const SupportUserCard = ({
  displayName,
  solana_address,
}: {
  displayName: string;
  solana_address: string;
}) => {
  const router = useRouter();
  const [customAmount, setCustomAmount] = useState("");
  const [walletConnected, setWalletConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const handleSupportUser = async (e: any, amount?: string) => {
    e.preventDefault();
    console.log("Sending transaction...", connection, publicKey);
    if (!connection || !publicKey) {
      setWalletConnected(false);
      console.log("Wallet isn't connected... :(");
      return;
    }
    setIsLoading(true);
    let transferAmount = amount ? parseFloat(amount) : parseFloat(customAmount);
    try {
      const transition = new Transaction();
      transition.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(solana_address),
          lamports: LAMPORTS_PER_SOL * transferAmount,
        })
      );
      const signature = await sendTransaction(transition, connection);
      router.push(`/check-explorer/${signature}`);
    } catch (error) {
      console.log("Error sending transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      setTimeout(() => {
        setWalletConnected(true);
      }, 2000);
    }
  }, [walletConnected]);

  return (
    <div className="lg:w-80">
      <Card className="w-full border-none bg-zinc-800/50 shadow-lg text-zinc-100">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">
            Support {displayName}
            {!walletConnected && (
              <p className="text-sm text-muted-foreground text-red-500 font-semibold">
                Wallet not connected
              </p>
            )}
          </CardTitle>
        </CardHeader>
        {isLoading ? (
          <div className="flex flex-col justify-center items-center pb-5">
            <Spinner size={"lg"} />
            <p className="text-sm text-muted-foreground">
              Processing your transaction...
            </p>
          </div>
        ) : (
          <CardContent className="space-y-4">
            <Button
              onClick={(e) => handleSupportUser(e, "0.1")}
              className="w-full bg-zinc-700 text-zinc-100 border-none transition-colors hover:bg-zinc-600"
            >
              Send 0.1 SOL
            </Button>

            <Button
              onClick={(e) => handleSupportUser(e, "0.5")}
              className="w-full bg-zinc-700 text-zinc-100 border-none transition-colors hover:bg-zinc-600"
            >
              Send 0.5 SOL
            </Button>

            <div className="space-y-2">
              <p className="text-sm font-medium">Custom amount</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  className="flex-1 bg-zinc-700 border-none text-zinc-100 placeholder-zinc-400"
                  placeholder="Amount"
                  min="0"
                  step="0.1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
                <span className="flex items-center text-sm">SOL</span>
              </div>
            </div>
            {customAmount && customAmount !== "0" && (
              <Button
                onClick={(e) => handleSupportUser(e)}
                className="w-full bg-zinc-700 text-zinc-100 border-none transition-colors hover:bg-zinc-600"
              >
                Send {customAmount} SOL
              </Button>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};
