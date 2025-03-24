"use client";

import { LandingFooter } from "@/components/LandingFooter";
import { LandingHeader } from "@/components/LandingHeader";
import { AnimatedCTAButton } from "@/components/ui/animated-cta-button";
import { Enhanced3DCard, FloatingCard } from "@/components/ui/enhanced-card";
import EnhancedParticles from "@/components/ui/enhanced-particles";
import { FadeIn, StaggerChildren } from "@/components/ui/scroll-animations";
import {
  GlitchText,
  TextReveal,
  TypewriterText,
} from "@/components/ui/text-reveal";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Shield, Sparkles, Wallet, Zap } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useRef } from "react";

export default function LandingPage() {
  const session = useSession();
  if (session?.data?.user) {
    redirect("/home");
  }

  // Scroll animations
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.6]);
  const backgroundScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col relative overflow-hidden"
    >
      {/* Enhanced particles background with interactive effects */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{ opacity: backgroundOpacity, scale: backgroundScale }}
      >
        <EnhancedParticles variant="crypto" interactivity={true} density={70} />
      </motion.div>

      {/* Animated gradient blurs */}
      <motion.div
        className="absolute top-0 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -z-10"
        animate={{
          x: [0, 20, 0],
          y: [0, 15, 0],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "mirror",
        }}
      />
      <motion.div
        className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10"
        animate={{
          x: [0, -20, 0],
          y: [0, -15, 0],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "mirror",
        }}
      />

      <LandingHeader />

      <main className="flex-grow flex flex-col justify-center items-center text-center p-6 z-10 pt-24 pb-16">
        <FadeIn duration={0.8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
              Support Creators with{" "}
              <GlitchText
                text="Crypto"
                glitchIntensity="medium"
                className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500"
              />
            </h1>
          </motion.div>
        </FadeIn>

        <FadeIn delay={0.2} duration={0.8}>
          <TypewriterText
            text="DAOnation is a decentralized platform that empowers creators and supporters to connect through cryptocurrency donations."
            className="text-xl mb-12 max-w-2xl text-zinc-300"
            typingSpeed={0.02}
            delayStart={0.5}
          />
        </FadeIn>

        <FadeIn delay={0.4} duration={0.8}>
          <AnimatedCTAButton
            size="lg"
            onClick={async () => {
              await signIn("google", {
                redirect: true,
                callbackUrl: "/edit-profile",
              });
            }}
            className="text-white px-8 py-6 text-lg font-bold shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-0"
            glowColor="rgba(124, 58, 237, 0.6)"
            pulseEffect={false}
            trailEffect={true}
          >
            Get Started <ArrowRight className="h-5 w-5 ml-2" />
          </AnimatedCTAButton>
        </FadeIn>

        <StaggerChildren className="mt-8 grid gap-8 md:grid-cols-3 max-w-4xl w-full">
          <FloatingCard delay={0} amplitude={8} duration={5}>
            <Enhanced3DCard
              className="p-8 cursor-default h-full"
              glowColor="rgba(99, 102, 241, 0.4)"
            >
              <div className="bg-indigo-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-white">
                Decentralized
              </h2>
              <p className="text-zinc-400">
                Fully* decentralized platform built on blockchain technology.
              </p>
            </Enhanced3DCard>
          </FloatingCard>

          <FloatingCard delay={0.2} amplitude={10} duration={5.5}>
            <Enhanced3DCard
              className="p-8 cursor-default h-full"
              glowColor="rgba(124, 58, 237, 0.4)"
            >
              <div className="bg-indigo-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-white">Transparent</h2>
              <p className="text-zinc-400">
                All transactions are public and verifiable on the blockchain.
              </p>
            </Enhanced3DCard>
          </FloatingCard>

          <FloatingCard delay={0.4} amplitude={7} duration={4.5}>
            <Enhanced3DCard
              className="p-8 cursor-default h-full"
              glowColor="rgba(139, 92, 246, 0.4)"
            >
              <div className="bg-indigo-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-white">Low Fees</h2>
              <p className="text-zinc-400">
                Minimal platform fees, more support goes directly to creators.
              </p>
            </Enhanced3DCard>
          </FloatingCard>
        </StaggerChildren>

        {/* New testimonial section */}
        <FadeIn className="mt-24 w-full max-w-4xl" threshold={0.1}>
          <div className="relative">
            <motion.div
              className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-30"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <div className="relative bg-zinc-800/80 backdrop-blur-sm p-8 rounded-xl">
              <Sparkles className="h-8 w-8 text-indigo-400 mb-4" />
              <TextReveal
                text="DAOnation has transformed how I receive support from my audience. The transparency and low fees make it the perfect platform for creators like me."
                className="text-lg text-zinc-300 italic mb-4"
              />
              <p className="text-right text-indigo-400 font-medium">
                — Alex Rivera, Digital Artist
              </p>
            </div>
          </div>
        </FadeIn>
      </main>

      <LandingFooter />
    </div>
  );
}
