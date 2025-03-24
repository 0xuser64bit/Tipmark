"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useInView } from "react-intersection-observer";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hoverEffect?: boolean;
  index?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  delay = 0,
  hoverEffect = true,
  index = 0,
}) => {
  const [hovered, setHovered] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-xl bg-zinc-800 border border-zinc-700/50",
        className,
        hoverEffect && "transition-all duration-300",
      )}
      initial={{ opacity: 0, y: 50 }}
      animate={
        inView
          ? {
              opacity: 1,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 80,
                damping: 20,
                delay: delay + index * 0.1,
              },
            }
          : { opacity: 0, y: 50 }
      }
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={
        hoverEffect
          ? {
              scale: 1.02,
              boxShadow: "0 10px 30px -15px rgba(79, 70, 229, 0.5)",
              borderColor: "rgba(99, 102, 241, 0.5)",
              transition: { duration: 0.2 },
            }
          : {}
      }
    >
      {hoverEffect && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-600/10 opacity-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      {children}
    </motion.div>
  );
};

export const AnimatedCardGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        className,
      )}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            index,
          });
        }
        return child;
      })}
    </div>
  );
};
