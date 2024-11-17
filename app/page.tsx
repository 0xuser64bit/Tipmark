"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Github, Twitter } from "lucide-react";
import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col">
      <header className="max-w-6xl mx-auto w-full p-6 flex justify-between items-center">
        <div className="text-2xl font-bold">DAOnation</div>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <a
                href="#about"
                className="hover:text-zinc-300 transition-colors"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#get-started"
                className="hover:text-zinc-300 transition-colors"
              >
                Get Started
              </a>
            </li>
          </ul>
        </nav>
      </header>

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
          Launch App
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

      <footer className="max-w-6xl mx-auto w-full p-6 flex justify-between items-center border-t border-zinc-800">
        <p className="text-sm text-zinc-400">
          © 2023 DAOnation. All rights reserved.
        </p>
        <div className="flex space-x-4">
          <a
            href="https://x.com/user64bit"
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
            target="_blank"
          >
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </a>
          <a
            href="https://github.com/user-64bit"
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
            target="_blank"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
