"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Github, Instagram, Linkedin, ShareIcon, Twitter } from "lucide-react";
import { useState } from "react";
import { Footer } from "./footer";
import { Header } from "./header";

export default function Dashboard({
  profileImage,
  coverImage,
  username,
  displayName,
  description,
  x_url,
  github_url,
  instagram_url,
  linkedin_url,
}: {
  profileImage: string;
  coverImage: string;
  username: string;
  displayName: string;
  description: string;
  x_url: string;
  github_url: string;
  instagram_url: string;
  linkedin_url: string;
}) {
  const [customAmount, setCustomAmount] = useState("");

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-grow">
        <Header />
        <main className="flex flex-col gap-8 items-start">
          <div className="w-full">
            <div className="relative">
              <div className="w-full h-48 sm:h-64 overflow-hidden">
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover cursor-pointer"
                />
              </div>
              <div className="absolute left-4 -bottom-16 sm:-bottom-20">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-zinc-900">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="mt-20 sm:mt-24">
              <h1 className="text-2xl font-semibold mb-4">{displayName}</h1>
              <div className="flex gap-4 mb-6">
                <Button
                  variant="outline"
                  className="bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 hover:text-white"
                >
                  Support Me
                </Button>
                <Button
                  variant="outline"
                  className="bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 hover:text-white"
                >
                  <ShareIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row justify-between w-full gap-8">
              <div className="flex-1">
                <Card className="w-full bg-zinc-800/50 border-none mb-6">
                  <CardContent className="p-4">
                    <p className="text-zinc-300">{description}</p>
                  </CardContent>
                </Card>
                <div className="w-full bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex justify-center gap-6 text-zinc-400">
                    <a
                      href={"https://x.com/" + x_url}
                      className="hover:text-zinc-100 transition-colors"
                      aria-label="Twitter"
                      target="_blank"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a
                      href={"https://instagram.com/" + instagram_url}
                      className="hover:text-zinc-100 transition-colors"
                      aria-label="Instagram"
                      target="_blank"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a
                      href={"https://github.com/" + github_url}
                      className="hover:text-zinc-100 transition-colors"
                      aria-label="GitHub"
                      target="_blank"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                    <a
                      href={"https://linkedin.com/" + linkedin_url}
                      className="hover:text-zinc-100 transition-colors"
                      aria-label="LinkedIn"
                      target="_blank"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="lg:w-80">
                <Card className="w-full border-none bg-zinc-800/50 shadow-lg text-zinc-100">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-center">
                      Support John Deo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full bg-zinc-700 text-zinc-100 border-none transition-colors hover:bg-zinc-600">
                      Send 0.1 SOL
                    </Button>

                    <Button className="w-full bg-zinc-700 text-zinc-100 border-none transition-colors hover:bg-zinc-600">
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
                      <Button className="w-full bg-zinc-700 text-zinc-100 border-none transition-colors hover:bg-zinc-600">
                        Send {customAmount} SOL
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
