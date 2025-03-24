"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./button";

interface AnimatedButtonProps extends ButtonProps {
  children: React.ReactNode;
  glowColor?: string;
  hoverScale?: number;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className,
  glowColor = "rgba(99, 102, 241, 0.8)",
  hoverScale = 1.05,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: hoverScale }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-full blur-xl opacity-70 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          style={{ backgroundColor: glowColor }}
        />
      )}
      <Button
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          className,
        )}
        {...props}
      >
        <motion.span
          className="relative z-10 flex items-center gap-2"
          animate={{
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {children}
        </motion.span>
      </Button>
    </motion.div>
  );
};

// Rainbow gradient outline button
export const RainbowButton: React.FC<ButtonProps> = ({
  children,
  className,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative p-[2px] overflow-hidden rounded-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        background: isHovered
          ? "linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)"
          : "linear-gradient(45deg, #4F46E5, #7C3AED)",
        backgroundSize: isHovered ? "400% 400%" : "100% 100%",
      }}
      animate={{
        backgroundPosition: isHovered ? ["0% 0%", "100% 100%"] : "0% 0%",
      }}
      transition={{
        duration: 3,
        repeat: isHovered ? Infinity : 0,
        repeatType: "mirror",
      }}
    >
      <Button
        className={cn(
          "relative z-10 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full w-full transition-all duration-300",
          className,
        )}
        variant="ghost"
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
};
