"use client";

import { LandingFooter } from "@/components/LandingFooter";
import { LandingHeader } from "@/components/LandingHeader";
import { Button } from "@/components/ui/button";
import { AnimatedCTAButton, MagneticButton } from "@/components/ui/animated-cta-button";
import { Enhanced3DCard, FloatingCard } from "@/components/ui/enhanced-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextReveal, GlitchText, TypewriterText } from "@/components/ui/text-reveal";
import { FadeIn, StaggerChildren } from "@/components/ui/scroll-animations";
import {
  ChevronRight,
  Globe,
  Wallet,
  Zap,
  ArrowRight
} from "lucide-react";
import { signIn } from "next-auth/react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import EnhancedParticles from "@/components/ui/enhanced-particles";

export default function AboutPage() {
  // Scroll animations
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.6]);
  const backgroundScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  return (
    <div ref={containerRef} className="min-h-screen bg-zinc-900 text-zinc-100 relative overflow-hidden">
      {/* Enhanced particles background */}
      <motion.div 
        className="absolute inset-0 -z-10"
        style={{ opacity: backgroundOpacity, scale: backgroundScale }}
      >
        <EnhancedParticles variant="stars" interactivity={true} density={60} />
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
      <main className="lg:w-3/5 mx-auto px-4 py-16 relative z-10">
        <FadeIn>
          <section className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-5xl font-bold mb-4">
                About <GlitchText text="DAOnation" className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500" />
              </h1>
            </motion.div>
            <TextReveal
              text="Support your favorite creators directly with crypto. It's like 'Buy Me a Coffee', but decentralized!"
              className="text-xl text-zinc-300 max-w-2xl mx-auto"
              revealDuration={0.5}
              revealDelay={0.2}
            />
          </section>
        </FadeIn>

        <StaggerChildren className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <FloatingCard key={index} delay={index * 0.2} amplitude={5 + index * 2} duration={4 + index}>
              <Enhanced3DCard 
                className="h-full bg-zinc-800/50 backdrop-blur-sm border-zinc-700/50"
                glowColor={`rgba(${index === 0 ? '99, 102, 241' : index === 1 ? '124, 58, 237' : '139, 92, 246'}, 0.4)`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-indigo-400">
                    <motion.div
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <span className="ml-2">{feature.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300">{feature.description}</p>
                </CardContent>
              </Enhanced3DCard>
            </FloatingCard>
          ))}
        </StaggerChildren>

        <FadeIn delay={0.3}>
          <section className="relative mb-16">
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-30"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <div className="relative bg-zinc-800/80 backdrop-blur-sm p-8 rounded-lg border border-zinc-700/50">
              <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                How It Works
              </h2>
              <ol className="space-y-6">
                {steps.map((step, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <motion.span 
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-900 text-indigo-200 font-bold mr-4"
                      whileHover={{ scale: 1.2, backgroundColor: "#4F46E5" }}
                    >
                      {index + 1}
                    </motion.span>
                    <span className="text-zinc-300">{step}</span>
                  </motion.li>
                ))}
              </ol>
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.5}>
          <section className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
              Ready to Support Creators?
            </h2>
            <TypewriterText
              text="Connect your wallet and start supporting your favorite creators with crypto!"
              className="text-xl text-zinc-300 mb-8"
              typingSpeed={0.02}
              delayStart={0.5}
            />
            <MagneticButton
              onClick={async () => {
                await signIn("google", {
                  redirect: true,
                  callbackUrl: "/edit-profile",
                });
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-5 rounded-full text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105"
              magnetStrength={0.4}
            >
              Get Started
              <ChevronRight className="ml-2 h-5 w-5" />
            </MagneticButton>
          </section>
        </FadeIn>
      </main>
      <LandingFooter />
    </div>
  );
}

const features = [
  {
    icon: <Wallet className="h-6 w-6" />,
    title: "Direct Crypto Payments",
    description:
      "Send cryptocurrency directly to creators, no middlemen involved.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Fast & Low Fees",
    description:
      "Quick transactions with minimal fees, maximizing your support.",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Global Reach",
    description:
      "Support creators from anywhere in the world, breaking down financial barriers.",
  },
];

const steps = [
  "Connect your cryptocurrency wallet to the DAOnation platform.",
  "Browse through creators or search for your favorites.",
  "Choose the amount of crypto you want to send.",
  "Confirm the transaction in your wallet.",
  "The creator receives your support directly and instantly!",
];
