"use client";

import { LayoutDashboard, LogOut, Menu, UserRound } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const DropdownSettings = () => {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="text-foreground"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-52 border-border bg-popover"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuItem
          className="cursor-pointer focus:bg-accent"
          onClick={() => router.push("/dashboard")}
        >
          <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer focus:bg-accent"
          onClick={() => router.push("/edit-profile")}
        >
          <UserRound className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Edit profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={() =>
            signOut({
              redirect: true,
              callbackUrl: "/",
            })
          }
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
