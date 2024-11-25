"use client";

import { LandingFooter } from "@/components/LandingFooter";
import { LandingHeader } from "@/components/LandingHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function LandingPage() {
  const session = useSession();
  if (session?.data?.user) {
    redirect("/home");
  }
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col">
      <LandingHeader />

      <main className="flex-grow flex flex-col justify-center items-center text-center p-6">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Support Creators with Crypto
        </h1>
        <p className="text-xl mb-8 max-w-2xl">
          DAOnation is a decentralized platform that empowers creators and
          supporters to connect through cryptocurrency donations.
        </p>
        <Button
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={async () => {
            await signIn("google", {
              redirect: true,
              callbackUrl: "/edit-profile",
            });
          }}
        >
          Get Started
        </Button>

        <div className="mt-16 grid gap-8 md:grid-cols-3 max-w-4xl">
          <Card className="bg-zinc-800 border-none">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-2 text-white">
                Decentralized
              </h2>
              <p className="text-zinc-400">
                Fully* decentralized platform built on blockchain technology.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-800 border-none">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-2 text-white">Transparent</h2>
              <p className="text-zinc-400">
                All transactions are public and verifiable on the blockchain.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-800 border-none">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-2 text-white">Low Fees</h2>
              <p className="text-zinc-400">
                Minimal platform fees, more support goes directly to creators.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
