import { DollarSign, LogOut, Menu, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const DropdownSettings = () => {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 hover:text-white"
          >
            <Menu />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 bg-zinc-800 border-zinc-700 mt-3"
          align="end"
        >
          <DropdownMenuItem
            className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100 cursor-pointer"
            onClick={() => redirect("/edit-profile")}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Account</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-700" />
          <DropdownMenuItem
            className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100 cursor-pointer"
            onClick={() => redirect("/dashboard")}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-700" />
          <DropdownMenuItem
            className="text-zinc-100 focus:bg-zinc-700 focus:text-zinc-100 cursor-pointer"
            onClick={async () =>
              await signOut({
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
    </div>
  );
};
