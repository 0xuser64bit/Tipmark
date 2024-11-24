"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ShareIcon } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Footer } from "./footer";
import { Header } from "./header";
import { SocialsCard } from "./socials-card";
import { SupportUserCard } from "./support-user";
import { GetCard } from "./get-card";

interface DashboardProps {
  profileImage: string;
  coverImage: string;
  username: string;
  displayName: string;
  description: string;
  x_username: string;
  github_username: string;
  instagram_username: string;
  linkedin_username: string;
  solana_address: string;
}

export default function Dashboard({
  profileImage,
  coverImage,
  username,
  displayName,
  description,
  x_username,
  github_username,
  instagram_username,
  linkedin_username,
  solana_address,
}: DashboardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://daonation.xyz/` + username);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
              <div className="mb-4">
                <h1 className="text-2xl font-semibold">{displayName}</h1>
                <span className="text-muted-foreground text-sm">
                  @{username}
                </span>
              </div>
              <div className="flex gap-4 mb-6">
                <GetCard 
                  name={displayName}
                  username={username}
                  profileUrl={"https://daonation.xyz/" + username}
                  imageUrl={profileImage}
                />
                <Button
                  variant="outline"
                  className="bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 hover:text-white"
                  onClick={() => handleCopy()}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <ShareIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row justify-between w-full gap-8">
              <div className="flex-1">
                <Card className="w-full bg-zinc-800/50 border-none mb-6">
                  <CardContent className="p-4">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      className="text-zinc-300"
                    >
                      {description}
                    </ReactMarkdown>
                  </CardContent>
                </Card>
                <SocialsCard
                  x_username={x_username}
                  instagram_username={instagram_username}
                  github_username={github_username}
                  linkedin_username={linkedin_username}
                />
              </div>
              <SupportUserCard
                displayName={displayName}
                solana_address={solana_address}
              />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
