"use client";

import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  count?: number;
  height?: number | string;
  width?: number | string;
  className?: string;
  borderRadius?: string;
  animated?: boolean;
  inline?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 1,
  height,
  width,
  className,
  borderRadius = '0.5rem',
  animated = true,
  inline = false,
}) => {
  const content = (
    <Skeleton
      count={count}
      height={height}
      width={width}
      borderRadius={borderRadius}
      inline={inline}
      className={cn("bg-zinc-800", className)}
      baseColor="#27272a"
      highlightColor="#3f3f46"
    />
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="w-full">
      <div className="relative">
        <div className="w-full h-48 sm:h-64 overflow-hidden">
          <SkeletonLoader height="100%" width="100%" />
        </div>
        <div className="absolute left-4 -bottom-16 sm:-bottom-20">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-zinc-900">
            <SkeletonLoader height="100%" width="100%" borderRadius="100%" />
          </div>
        </div>
      </div>
      <div className="mt-20 sm:mt-24 space-y-4">
        <SkeletonLoader height={24} width={180} />
        <SkeletonLoader height={16} width={120} />
        <div className="flex gap-4 mb-6">
          <SkeletonLoader height={40} width={120} />
          <SkeletonLoader height={40} width={40} />
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SkeletonLoader height={120} className="rounded-xl" />
      <SkeletonLoader height={120} className="rounded-xl" />
      <SkeletonLoader height={120} className="rounded-xl" />
      <SkeletonLoader height={120} className="rounded-xl" />
      <div className="col-span-4">
        <SkeletonLoader height={300} className="rounded-xl" />
      </div>
      <div className="col-span-4">
        <SkeletonLoader height={400} className="rounded-xl" />
      </div>
    </div>
  );
}; 