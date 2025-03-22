"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface Enhanced3DCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  borderColor?: string;
  backgroundGradient?: string;
  hoverScale?: number;
  rotationIntensity?: number;
}

export const Enhanced3DCard: React.FC<Enhanced3DCardProps> = ({
  children,
  className,
  glowColor = "rgba(99, 102, 241, 0.3)",
  borderColor = "rgba(99, 102, 241, 0.2)",
  backgroundGradient = "linear-gradient(145deg, rgba(39, 39, 42, 0.8), rgba(24, 24, 27, 0.9))",
  hoverScale = 1.02,
  rotationIntensity = 10,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Motion values for rotation
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smoother rotation with springs
  const rotateX = useSpring(useTransform(y, [-300, 300], [rotationIntensity, -rotationIntensity]), {
    stiffness: 200,
    damping: 25
  });
  const rotateY = useSpring(useTransform(x, [-300, 300], [-rotationIntensity, rotationIntensity]), {
    stiffness: 200,
    damping: 25
  });

  // Handle mouse move for 3D effect
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  }

  // Reset position when not hovering
  function handleMouseLeave() {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative rounded-xl overflow-hidden backdrop-blur-sm",
        className
      )}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        background: backgroundGradient,
        boxShadow: isHovered 
          ? `0 10px 30px -10px ${glowColor}, 0 0 0 1px ${borderColor}` 
          : `0 2px 10px -2px rgba(0, 0, 0, 0.2), 0 0 0 1px ${borderColor}`,
      }}
      whileHover={{ scale: hoverScale }}
      transition={{ duration: 0.2 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0 opacity-60 mix-blend-overlay"
        style={{
          background: "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)",
          transform: "translateZ(2px)",
        }}
      />
      
      {/* Shine effect on hover */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: "linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%)",
            backgroundSize: "200% 200%",
            transform: "translateZ(1px)",
          }}
          initial={{ backgroundPosition: "100% 100%" }}
          animate={{ backgroundPosition: "0% 0%" }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "mirror" }}
        />
      )}
      
      {/* Content container with perspective */}
      <div 
        className="relative z-10 h-full"
        style={{ transform: "translateZ(20px)" }}
      >
        {children}
      </div>
    </motion.div>
  );
};

export const FloatingCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  amplitude?: number;
  duration?: number;
}> = ({
  children,
  className,
  delay = 0,
  amplitude = 10,
  duration = 4,
}) => {
  return (
    <motion.div
      className={cn("relative", className)}
      initial={{ y: 0 }}
      animate={{ y: [0, -amplitude, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
};
