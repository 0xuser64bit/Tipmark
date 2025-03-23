"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./button";

interface AnimatedGradientButtonProps extends ButtonProps {
  gradientFrom?: string;
  gradientTo?: string;
  hoverScale?: number;
  pulseEffect?: boolean;
}

export const AnimatedGradientButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedGradientButtonProps
>(({
  children,
  className,
  gradientFrom = "#4f46e5",
  gradientTo = "#ec4899",
  hoverScale = 1.03,
  pulseEffect = true,
  ...props
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative rounded-md"
      whileHover={{ scale: hoverScale }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute inset-0 rounded-md opacity-0 z-0"
        animate={{
          opacity: isHovered ? 0.8 : 0,
          background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo}, ${gradientFrom})`,
          backgroundSize: isHovered ? "200% 100%" : "100% 100%",
          backgroundPosition: isHovered ? "100% 0%" : "0% 0%",
        }}
        transition={{
          opacity: { duration: 0.3 },
          background: { duration: 3, repeat: Infinity, ease: "linear" }
        }}
        style={{
          filter: "blur(8px)"
        }}
      />

      {/* Actual button */}
      <Button
        ref={ref}
        className={cn(
          "relative z-10 bg-zinc-800 hover:bg-zinc-700 border-none",
          "transition-all duration-300",
          isHovered && "text-white shadow-lg",
          className
        )}
        {...props}
      >
        {/* Pulsing animation on hover */}
        {pulseEffect && isHovered && (
          <motion.div
            className="absolute inset-0 rounded-md opacity-0 bg-white"
            animate={{
              opacity: [0, 0.1, 0],
              scale: [0.8, 1.05, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
        {children}
      </Button>
    </motion.div>
  );
});

AnimatedGradientButton.displayName = "AnimatedGradientButton"; 