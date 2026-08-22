import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 text-center">
      <Logo className="mb-10" />
      <p className="font-mono text-8xl font-bold tracking-tighter text-foreground/10">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
        This page went off-chain
      </h1>
      <p className="mt-3 max-w-sm text-[15px] text-muted-foreground leading-relaxed">
        The link may be broken, or the page may have moved. Let&apos;s get you
        back on track.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild variant="brand" className="h-11 px-6">
          <Link href="/">
            <Home className="h-4 w-4 mr-1.5" /> Home
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-11 px-6">
          <Link href="/about-us">
            <Compass className="h-4 w-4 mr-1.5 opacity-70" /> Learn more
          </Link>
        </Button>
      </div>
    </div>
  );
}
