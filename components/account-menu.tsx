"use client";

import { LogOut, Pencil, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

/**
 * The account menu holds identity and exits — never primary navigation.
 * Where you can go lives in the header nav, visibly, at every screen size.
 */
export function AccountMenu() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label="Account">
          <User />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={7} className="w-60">
        {email && (
          <>
            <DropdownMenuLabel className="normal-case tracking-normal">
              <span className="figure block truncate text-[11.5px] text-ink-soft">
                {email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <Link href="/edit-profile">
            <Pencil />
            Edit your page
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-seal focus:bg-seal-soft"
          onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
        >
          <LogOut className="[&&]:text-seal" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
