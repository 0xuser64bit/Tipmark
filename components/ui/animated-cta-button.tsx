"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./button";

interface AnimatedCTAButtonProps extends ButtonProps {
  children: React.ReactNode;
  glowColor?: string;
  hoverScale?: number;
  pulseEffect?: boolean;
  trailEffect?: boolean;
}

export const AnimatedCTAButton: React.FC<AnimatedCTAButtonProps> = ({
  children,
  className,
  glowColor = "rgba(99, 102, 241, 0.8)",
  hoverScale = 1.05,
  pulseEffect = true,
  trailEffect = true,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [trails, setTrails] = useState<{ id: number; x: number; y: number; opacity: number }[]>([]);
  const [trailId, setTrailId] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trailEffect) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
    
    // Add trail particle
    if (isHovered) {
      const newTrail = {
        id: trailId,
        x,
        y,
        opacity: 1
      };
      
      setTrails(prev => [...prev, newTrail]);
      setTrailId(prev => prev + 1);
      
      // Remove old trails
      setTimeout(() => {
        setTrails(prev => prev.filter(trail => trail.id !== newTrail.id));
      }, 500);
    }
  };

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: hoverScale }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => {
        setIsHovered(false);
        setTrails([]);
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Glow effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-full blur-xl -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          style={{ backgroundColor: glowColor }}
        />
      )}
      
      {/* Pulse animation */}
      {pulseEffect && (
        <motion.div
          className="absolute inset-0 rounded-full -z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1.2, 0.8], 
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
          }}
          style={{ backgroundColor: glowColor }}
        />
      )}
      
      {/* Mouse trail effect */}
      {trails.map((trail, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 rounded-full pointer-events-none -z-5"
          style={{
            left: trail.x - 8,
            top: trail.y - 8,
            backgroundColor: glowColor,
          }}
          initial={{ opacity: 0.7, scale: 0.8 }}
          animate={{ opacity: 0, scale: 0.2 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      ))}
      
      <Button
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          className
        )}
        {...props}
      >
        {/* Shine effect */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 opacity-50"
            initial={{ x: "-100%", opacity: 0.5 }}
            animate={{ x: "100%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
            }}
          />
        )}
        
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

export const MagneticButton: React.FC<ButtonProps & { magnetStrength?: number }> = ({
  children,
  className,
  magnetStrength = 0.3,
  ...props
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const buttonRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    // Apply magnetic effect
    setPosition({ 
      x: distanceX * magnetStrength, 
      y: distanceY * magnetStrength 
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={buttonRef}
      className="relative inline-block"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
    >
      <Button
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
};
