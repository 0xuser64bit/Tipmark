"use client";

import React, { useCallback, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion } from "framer-motion";

interface EnhancedParticlesProps {
  id?: string;
  className?: string;
  variant?: "default" | "crypto" | "stars" | "bubbles";
  interactivity?: boolean;
  density?: number;
  speed?: number;
  color?: string[];
}

const EnhancedParticles: React.FC<EnhancedParticlesProps> = ({
  id = "enhanced-particles",
  className,
  variant = "default",
  interactivity = true,
  density = 50,
  speed = 1,
  color = ["#4F46E5", "#7C3AED", "#8B5CF6"],
}) => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = useCallback(async (container: any) => {
    // console.log(container);
  }, []);

  const getVariantOptions = () => {
    const baseOptions = {
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 60,
      particles: {
        color: {
          value: color,
        },
        links: {
          color: color[0],
          distance: 150,
          enable: variant !== "stars" && variant !== "bubbles",
          opacity: 0.2,
          width: 1,
        },
        move: {
          direction: "none" as const, // Type assertion to fix TypeScript error
          enable: true,
          outModes: {
            default: "bounce" as const, // Type assertion to fix TypeScript error
          },
          random: false,
          speed: speed,
          straight: false,
        },
        number: {
          value: density,
        },
        opacity: {
          value: 0.3,
          animation: {
            enable: variant === "stars",
            speed: 1,
            minimumValue: 0.1,
          },
        },
        shape: {
          type: variant === "crypto" 
            ? ["circle", "triangle", "polygon"] 
            : variant === "bubbles" 
              ? "circle" 
              : "circle",
        },
        size: {
          value: variant === "bubbles" 
            ? { min: 2, max: 8 } 
            : variant === "stars" 
              ? { min: 1, max: 3 } 
              : { min: 1, max: 3 },
          animation: {
            enable: variant === "bubbles",
            speed: 2,
            minimumValue: 0.5,
          },
        },
      },
      detectRetina: true,
    };

    if (interactivity) {
      return {
        ...baseOptions,
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: "push" as const,
            },
            onHover: {
              enable: true,
              mode: (variant === "bubbles" ? "bubble" : "grab") as string,
              parallax: {
                enable: true,
                force: 60,
                smooth: 10,
              },
            },
            // Fix resize event type
            resize: {
              enable: true,
              delay: 0.5,
              factor: 1
            },
          },
          modes: {
            push: {
              quantity: 4,
            },
            grab: {
              distance: 140,
              links: {
                opacity: 0.5,
              },
            },
            bubble: {
              distance: 200,
              size: 12,
              duration: 2,
              opacity: 0.8,
            },
          },
        },
      };
    }

    return baseOptions;
  };

  if (!init) {
    return null;
  }

  return (
    <motion.div className="absolute inset-0 z-0">
      <Particles
        id={id}
        className={className}
        particlesLoaded={particlesLoaded}
        options={getVariantOptions()}
      />
      
      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-900/50" />
      
      {variant === "crypto" && (
        <motion.div 
          className="absolute inset-0 bg-gradient-radial from-indigo-500/5 via-transparent to-transparent"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
      )}
    </motion.div>
  );
};

export default EnhancedParticles;
