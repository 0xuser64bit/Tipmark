import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-grid px-4 text-center">
      <div
        aria-hidden
        className="absolute inset-x-0 top-1/3 -z-10 mx-auto h-48 w-72 rounded-full bg-brand/10 blur-3xl"
      />
      <Logo className="mb-8" />
      <p className="text-gradient font-mono text-7xl font-semibold">404</p>
      <h1 className="mt-4 text-xl font-semibold tracking-tight">
        This page went off-chain
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        The link may be broken, or the page may have moved. Let&apos;s get you
        back on track.
      </p>
      <div className="mt-7 flex gap-3">
        <Button asChild variant="brand">
          <Link href="/">
            <Home className="h-4 w-4" /> Home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/about-us">
            <Compass className="h-4 w-4" /> Learn more
          </Link>
        </Button>
      </div>
    </div>
  );
}
