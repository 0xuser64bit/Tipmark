"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Github, Instagram, Linkedin, ShareIcon, Twitter } from "lucide-react";

export default function UserProfile() {
  const [customAmount, setCustomAmount] = useState("");

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 w-full flex-grow">
        <header className="flex justify-between items-center mb-6">
          <div className="font-bold flex items-center justify-center">
            DAOnation
          </div>
          <Button
            variant="outline"
            className="bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 hover:text-white"
          >
            Connect Wallet
          </Button>
        </header>

        <main className="flex flex-col gap-8 items-start">
          <div className="w-full">
            <div className="relative">
              <div className="w-full h-48 sm:h-64 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z3JhZGllbnR8ZW58MHx8MHx8fDA%3D"
                  alt="Cover"
                  className="w-full h-full object-cover cursor-pointer"
                />
              </div>
              <div className="absolute left-4 -bottom-16 sm:-bottom-20">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-zinc-900">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzl8fHByb2ZpbGV8ZW58MHx8MHx8fDA%3D"
                    alt="Profile"
                    className="w-full h-full object-cover cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="mt-20 sm:mt-24">
              <h1 className="text-2xl font-semibold mb-4">John Deo</h1>
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
                  <ShareIcon className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row justify-between w-full gap-8">
              <div className="flex-1">
                <Card className="w-full bg-zinc-800/50 border-none mb-6">
                  <CardContent className="p-4">
                    <p className="text-zinc-300">
                      Description or about me by John Deo. Here you can write a
                      brief introduction about yourself, your work, or your
                      interests. This is a great place to showcase your
                      personality and connect with your supporters.
                    </p>
                  </CardContent>
                </Card>
                <div className="w-full bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex justify-center gap-6 text-zinc-400">
                    <a
                      href="#"
                      className="hover:text-zinc-100 transition-colors"
                      aria-label="Twitter"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a
                      href="#"
                      className="hover:text-zinc-100 transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a
                      href="#"
                      className="hover:text-zinc-100 transition-colors"
                      aria-label="GitHub"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                    <a
                      href="#"
                      className="hover:text-zinc-100 transition-colors"
                      aria-label="LinkedIn"
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

      <footer className="mt-auto py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center text-zinc-400 text-sm gap-2">
          <p>All Rights reserved @DAOnation</p>
          <div className="flex gap-4">
            <a
              href="#"
              className="hover:text-zinc-100 transition-colors"
              aria-label="GitHub"
            >
              <Github />
            </a>
            <span>|</span>
            <a
              href="#"
              className="hover:text-zinc-100 transition-colors"
              aria-label="Twitter"
            >
              <Twitter />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
