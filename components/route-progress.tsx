"use client";

import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import { useEffect, Suspense } from "react";

function RouteProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Configure NProgress
    NProgress.configure({
      minimum: 0.3,
      easing: "ease",
      speed: 800,
      showSpinner: false,
    });

    // Start progress bar
    NProgress.start();

    // Complete progress bar after a small delay to ensure it's visible
    const timer = setTimeout(() => {
      NProgress.done();
    }, 300);

    return () => {
      clearTimeout(timer);
      NProgress.remove();
    };
  }, [pathname, searchParams]);

  return null;
}

export function RouteChangeProgress() {
  return (
    <Suspense>
      <RouteProgressInner />
    </Suspense>
  );
}
