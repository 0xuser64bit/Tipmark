"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useInView } from "react-intersection-observer";

interface TextRevealProps {
  text: string;
  className?: string;
  textClassName?: string;
  revealDuration?: number;
  revealDelay?: number;
  once?: boolean;
  threshold?: number;
  highlightColor?: string;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  className,
  textClassName,
  revealDuration = 0.5,
  revealDelay = 0,
  once = true,
  threshold = 0.1,
  highlightColor = "rgba(99, 102, 241, 0.3)",
}) => {
  const { ref, inView } = useInView({
    triggerOnce: once,
    threshold,
  });

  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: revealDelay,
      },
    },
  };

  const child = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: revealDuration,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={cn("overflow-hidden", className)}
      variants={container}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block"
          variants={child}
          style={{ marginRight: "0.25em" }}
        >
          <span className={cn(textClassName)}>{word}</span>
        </motion.span>
      ))}
    </motion.div>
  );
};

export const GlitchText: React.FC<{
  text: string;
  className?: string;
  glitchIntensity?: "light" | "medium" | "heavy";
}> = ({ text, className, glitchIntensity = "medium" }) => {
  const intensityMap = {
    light: 2,
    medium: 4,
    heavy: 8,
  };

  const intensity = intensityMap[glitchIntensity];

  return (
    <div className={cn("relative inline-block", className)}>
      <span className="relative z-10">{text}</span>
      <motion.span
        className="absolute left-0 top-0 text-indigo-500 opacity-70 z-0"
        animate={{
          x: [0, -intensity, 0, intensity, 0],
          y: [0, intensity, -intensity, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        style={{ clipPath: "inset(0 0 50% 0)" }}
      >
        {text}
      </motion.span>
      <motion.span
        className="absolute left-0 top-0 text-purple-500 opacity-70 z-0"
        animate={{
          x: [0, intensity, 0, -intensity, 0],
          y: [0, -intensity, intensity, 0],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        style={{ clipPath: "inset(50% 0 0 0)" }}
      >
        {text}
      </motion.span>
    </div>
  );
};

export const TypewriterText: React.FC<{
  text: string;
  className?: string;
  typingSpeed?: number;
  delayStart?: number;
  cursorColor?: string;
}> = ({
  text,
  className,
  typingSpeed = 0.05,
  delayStart = 0,
  cursorColor = "#6366f1",
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const characters = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: typingSpeed, delayChildren: delayStart },
    }),
  };

  const child = {
    hidden: { opacity: 0, display: "none" },
    visible: {
      opacity: 1,
      display: "inline-block",
    },
  };

  return (
    <div className={cn("relative", className)}>
      <motion.div
        ref={ref}
        style={{ display: "inline-block" }}
        variants={container}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {characters.map((character, index) => (
          <motion.span key={index} variants={child} className="inline-block">
            {character === " " ? "\u00A0" : character}
          </motion.span>
        ))}
      </motion.div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatDelay: 0,
          delay: delayStart + text.length * typingSpeed,
        }}
        style={{
          display: "inline-block",
          width: "0.1em",
          height: "1.2em",
          backgroundColor: cursorColor,
          marginLeft: "0.1em",
          verticalAlign: "text-top",
        }}
      />
    </div>
  );
};
