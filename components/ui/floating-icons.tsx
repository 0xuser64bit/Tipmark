"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Award, BarChart2, CreditCard, DollarSign, TrendingUp, Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";

interface FloatingIconsProps {
  className?: string;
  iconColor?: string;
  iconSize?: number;
  iconCount?: number;
  speed?: number;
}

export const FloatingIcons: React.FC<FloatingIconsProps> = ({
  className,
  iconColor = "rgba(79, 70, 229, 0.3)",
  iconSize = 24,
  iconCount = 15,
  speed = 20,
}) => {
  const icons = [DollarSign, CreditCard, TrendingUp, BarChart2, Wallet, Award];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  
  // Generate random positions and animations for each icon
  const iconElements = Array.from({ length: iconCount }).map((_, index) => {
    const Icon = icons[index % icons.length];
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const delay = Math.random() * 5;
    const duration = speed + Math.random() * 20;
    
    // Random float path
    const path = {
      x: [
        startX + Math.random() * 10 - 5,
        startX + Math.random() * 20 - 10,
        startX + Math.random() * 10 - 5,
        startX,
      ],
      y: [
        startY + Math.random() * 10 - 5,
        startY + Math.random() * 20 - 10,
        startY + Math.random() * 10 - 5,
        startY,
      ],
      rotate: [0, Math.random() * 30 - 15, 0, Math.random() * 30 - 15, 0],
    };
    
    return (
      <motion.div
        key={index}
        className="absolute"
        style={{
          left: `${startX}%`,
          top: `${startY}%`,
          color: iconColor,
        }}
        animate={path}
        transition={{
          duration,
          ease: "easeInOut",
          repeat: Infinity,
          delay,
          repeatType: "reverse",
        }}
      >
        <Icon size={iconSize} strokeWidth={1} />
      </motion.div>
    );
  });

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none z-0",
        className
      )}
    >
      {iconElements}
    </div>
  );
}; 