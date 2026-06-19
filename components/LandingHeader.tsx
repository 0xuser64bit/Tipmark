"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { AppNav } from "./app-nav";
import { Button } from "./ui/button";

export const LandingHeader = () => {
  return (
    <AppNav
      right={
        <>
          <Link
            href="/about-us"
            className="hidden px-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            About
          </Link>
          <Button
            variant="brand"
            size="sm"
            onClick={() =>
              signIn("google", {
                redirect: true,
                callbackUrl: "/edit-profile",
              })
            }
          >
            Start earning
          </Button>
        </>
      }
    />
  );
};
