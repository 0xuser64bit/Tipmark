import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";
import UserCard from "./user-card";

export const GetCard = ({
  name,
  username,
  profileUrl,
  imageUrl,
}: {
  name: string;
  username: string;
  profileUrl: string;
  imageUrl: string;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 hover:text-white"
        >
          Get Card
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-transparent border-0 [&>button]:hidden">
        <DialogTitle className="hidden">Get your card</DialogTitle>
        <Download
          role="button"
          onClick={() => console.log("download")}
          className="h-4 w-4 text-white ml-auto mr-6"
        />
        <UserCard
          name={name}
          username={username}
          imageUrl={imageUrl}
          profileUrl={profileUrl}
        />
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
