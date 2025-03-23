"use client";

import { addTransactionToDB } from "@/actions/addTransactionToDB";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { motion } from "framer-motion";
import { CreditCard, DollarSign, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "./spinner";
import { AnimatedGradientButton } from "./ui/animated-gradient-button";
import { Card, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { LoadingButton } from "./ui/loading-button";

export const SupportUserCard = ({
  displayName,
  solana_address,
  email,
}: {
  displayName: string;
  solana_address: string;
  email: string;
}) => {
  const router = useRouter();
  const [customAmount, setCustomAmount] = useState("");
  const [walletConnected, setWalletConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const checkTransactionStatus = async ({
    signature,
    amount,
    fromPubkey,
    toPubkey,
  }: {
    signature: string;
    amount: string;
    fromPubkey: string;
    toPubkey: string;
  }) => {
    const status = await connection.getSignatureStatus(signature, {
      searchTransactionHistory: true,
    });
    const transaction = await addTransactionToDB({
      userId: email,
      hash: signature,
      amount: amount,
      fromPublicKey: fromPubkey,
      toPublicKey: toPubkey,
      status: status.value?.confirmationStatus!,
    });
    if (status && transaction) {
      router.push(`/check-explorer/${signature}`);
    }
  };

  const handleSupportUser = async (e: any, amount?: string) => {
    e.preventDefault();
    if (!connection || !publicKey) {
      setWalletConnected(false);
      return;
    }
    setIsLoading(true);
    let transferAmount = amount ? parseFloat(amount) : parseFloat(customAmount);
    try {
      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(solana_address),
          lamports: LAMPORTS_PER_SOL * transferAmount,
        })
      );
      const signature = await sendTransaction(transaction, connection);
      // Hack: wait for transaction to be confirmed
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await checkTransactionStatus({
        signature,
        amount: transferAmount.toString(),
        fromPubkey: publicKey.toString(),
        toPubkey: solana_address,
      });
    } catch (error) {
      toast.error("Error sending transaction");
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
  const predefinedAmounts = [0.1, 0.5, 1, 5];

  return (
    <motion.div
      whileHover={{ 
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        translateY: -2
      }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="w-full lg:w-[350px] transition-all duration-300 bg-zinc-800/90 border-zinc-700/50 p-4"
      >
        <div className="space-y-4">
          <div className="flex flex-row items-center justify-between px-2">
            <div className="flex flex-col space-y-1.5">
              <CardTitle className="text-lg font-semibold text-white">
                Support {displayName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Directly support with Solana
              </p>
            </div>
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.8 }}
              className="p-2 rounded-full bg-pink-500/10"
            >
              <DollarSign size={20} className="text-pink-400" />
            </motion.div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {predefinedAmounts.map((amount, i) => (
              <motion.div
                key={amount}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2 }}
              >
                <AnimatedGradientButton
                  key={amount}
                  variant="outline"
                  className={`w-full bg-zinc-800 hover:bg-zinc-700 hover:text-zinc-100 text-zinc-100 border-zinc-700 ${
                    parseInt(customAmount) === amount
                      ? "bg-pink-500/20 border-pink-500/50 text-zinc-100"
                      : ""
                  }`}
                  onClick={(e) => handleSupportUser(e, amount.toString())}
                  gradientFrom="#ec4899"
                  gradientTo="#8b5cf6"
                  disabled={isLoading}
                >
                  {isLoading && parseInt(customAmount) === amount ? (
                    <Spinner size="sm" />
                  ) : (
                    <>{amount} SOL</>
                  )}
                </AnimatedGradientButton>
              </motion.div>
            ))}
          </div>

          <div className="relative">
            <form onSubmit={(e) => handleSupportUser(e)} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <motion.div
                    className="absolute left-3 top-1/3 transform -translate-y-1/2 text-zinc-400"
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                    transition={{
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 2,
                      repeatDelay: 5,
                    }}
                  >
                    <CreditCard size={16} />
                  </motion.div>
                  <Input
                    type="text"
                    placeholder="Custom amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100"
                    disabled={isLoading}
                  />
                </div>
                <LoadingButton
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white"
                  isLoading={isLoading}
                >
                  <Send size={16} className="mr-1" />
                </LoadingButton>
              </div>
            </form>
          </div>

          <div className="text-center text-xs text-zinc-400 mt-4">
            <p>Transactions are secure and powered by Solana</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
