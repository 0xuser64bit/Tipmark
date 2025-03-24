"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button, ButtonProps } from "./button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonProps {
  isLoading: boolean;
  loadingText?: string;
  successText?: string;
  showSuccess?: boolean;
  successDuration?: number;
  loaderSize?: number;
}

export const LoadingButton = React.forwardRef<
  HTMLButtonElement,
  LoadingButtonProps
>(
  (
    {
      children,
      className,
      isLoading,
      loadingText = "Loading...",
      successText = "Success!",
      showSuccess = false,
      successDuration = 1000,
      loaderSize = 16,
      disabled,
      onClick,
      ...props
    },
    ref,
  ) => {
    const [showSuccessState, setShowSuccessState] = React.useState(false);

    // Handle click with success animation
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(e);

        // If showSuccess is enabled and the click was successful (not disabled or loading)
        if (showSuccess && !disabled && !isLoading) {
          setShowSuccessState(true);

          // Reset after showing success
          setTimeout(() => {
            setShowSuccessState(false);
          }, successDuration);
        }
      }
    };

    // Determine the button's state
    const isSuccessState = showSuccess && showSuccessState;
    const isDisabled = disabled || isLoading || isSuccessState;

    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          isSuccessState && "bg-green-600 hover:bg-green-700 text-white",
          className,
        )}
        disabled={isDisabled}
        onClick={handleClick}
        {...props}
      >
        {/* Loading spinner with fade effect */}
        {isLoading && (
          <motion.span
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Loader2 size={loaderSize} className="animate-spin mr-2" />
          </motion.span>
        )}

        {/* Success state */}
        {isSuccessState && (
          <motion.span
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {successText}
          </motion.span>
        )}

        {/* Normal content */}
        <span
          className={cn(
            "transition-opacity duration-200",
            (isLoading || isSuccessState) && "opacity-0",
          )}
        >
          {children}
        </span>
      </Button>
    );
  },
);

LoadingButton.displayName = "LoadingButton";
