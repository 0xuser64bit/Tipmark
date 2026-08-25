import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b border-rule">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-5 sm:px-8">
          <Logo />
        </div>
      </div>

      <main
        id="main"
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-20 sm:px-8"
      >
        <p className="field-label">404</p>
        <h1 className="mt-4 max-w-[22ch] text-[clamp(2rem,5vw,3rem)] font-medium leading-[1.05]">
          There is no page here.
        </h1>
        <p className="mt-5 max-w-[48ch] text-[15px] leading-relaxed text-ink-faint">
          Either the handle was never claimed, its owner has not finished
          setting up a wallet to receive with, or the link has a typo in it.
        </p>
        <div className="mt-9 flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/">Back to the start</Link>
          </Button>
          <Button asChild variant="quiet">
            <Link href="/about-us">How Tipmark works</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
