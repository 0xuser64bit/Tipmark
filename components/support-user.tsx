import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

export const SupportUserCard = ({ displayName }: { displayName: string }) => {
  const [customAmount, setCustomAmount] = useState("");
  return (
    <div className="lg:w-80">
      <Card className="w-full border-none bg-zinc-800/50 shadow-lg text-zinc-100">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">
            Support {displayName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full bg-zinc-700 text-zinc-100 border-none transition-colors hover:bg-zinc-600">
            Send 0.1 SOL
          </Button>

          <Button className="w-full bg-zinc-700 text-zinc-100 border-none transition-colors hover:bg-zinc-600">
            Send 0.5 SOL
          </Button>

          <div className="space-y-2">
            <p className="text-sm font-medium">Custom amount</p>
            <div className="flex gap-2">
              <Input
                type="number"
                className="flex-1 bg-zinc-700 border-none text-zinc-100 placeholder-zinc-400"
                placeholder="Amount"
                min="0"
                step="0.1"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
              <span className="flex items-center text-sm">SOL</span>
            </div>
          </div>
          {customAmount && customAmount !== "0" && (
            <Button className="w-full bg-zinc-700 text-zinc-100 border-none transition-colors hover:bg-zinc-600">
              Send {customAmount} SOL
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
