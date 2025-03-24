"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check, ShareIcon } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Footer } from "./footer";
import { GetCard } from "./get-card";
import { Header } from "./header";
import { SocialsCard } from "./socials-card";
import { SupportUserCard } from "./support-user";
import { AnimatedGradientButton } from "./ui/animated-gradient-button";
import { AnimatedText } from "./ui/animated-text";

interface HomeProps {
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
  email: string;
}

export default function Home({
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
  email,
}: HomeProps) {
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
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-full h-48 sm:h-64 overflow-hidden rounded-xl">
                <motion.img
                  src={coverImage ?? "/dummy-cover.png"}
                  alt="Cover"
                  className="w-full h-full object-cover cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <motion.div
                className="absolute left-4 -bottom-16 sm:-bottom-20"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-zinc-900">
                  <motion.img
                    src={profileImage ?? "/sol.png"}
                    alt="Profile"
                    className="w-full h-full object-cover cursor-pointer"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            </motion.div>
            <motion.div
              className="mt-20 sm:mt-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="mb-4">
                <AnimatedText
                  text={displayName}
                  className="text-2xl font-semibold"
                  delay={1}
                />
                <motion.span
                  className="text-muted-foreground text-sm block"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  @{username}
                </motion.span>
              </div>
              <div className="flex gap-4 mb-6">
                <GetCard
                  name={displayName}
                  username={username}
                  profileUrl={"https://daonation.xyz/" + username}
                  imageUrl={profileImage}
                />
                <AnimatedGradientButton
                  variant="outline"
                  className="bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 hover:text-white"
                  onClick={handleCopy}
                  gradientFrom="rgba(99, 102, 241, 0.8)"
                  gradientTo="rgba(236, 72, 153, 0.8)"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <ShareIcon className="h-4 w-4" />
                  )}
                </AnimatedGradientButton>
              </div>
            </motion.div>

            <div className="flex flex-col lg:flex-row justify-between w-full gap-8">
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <motion.div
                  whileHover={{
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    translateY: -2,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="w-full bg-zinc-800/50 border-zinc-700/50 border mb-6">
                    <CardContent className="p-4">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className="text-zinc-300"
                      >
                        {description}
                      </ReactMarkdown>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    translateY: -2,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <SocialsCard
                    x_username={x_username}
                    instagram_username={instagram_username}
                    github_username={github_username}
                    linkedin_username={linkedin_username}
                  />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                whileHover={{
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  translateY: -2,
                }}
              >
                <SupportUserCard
                  displayName={displayName}
                  solana_address={solana_address}
                  email={email}
                />
              </motion.div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
