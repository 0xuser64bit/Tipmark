import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Github,
  Instagram,
  Linkedin,
  ShareIcon,
  Twitter,
  X,
} from "lucide-react";

export default function UserProfile() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col">
      <div className="max-w-6xl mx-auto p-6 w-full flex-grow">
        <header className="flex justify-between items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
            logo
          </div>
          <Button
            variant="outline"
            className="bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 hover:text-white"
          >
            Connect Wallet
          </Button>
        </header>

        <main className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1">
            <div className="flex flex-col items-center">
              <div className="w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z3JhZGllbnR8ZW58MHx8MHx8fDA%3D"
                  alt="Cover"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div>
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-900 mx-auto">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzl8fHByb2ZpbGV8ZW58MHx8MHx8fDA%3D"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-2xl font-semibold mb-4 text-center">
                  John Deo
                </h1>
                <div className="flex gap-4 mb-6 justify-center">
                  <Button
                    variant="outline"
                    className="bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 hover:text-white"
                  >
                    Support Me
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700 hover:text-white"
                  >
                    <ShareIcon className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="flex justify-end w-full gap-x-4">
                <div className="">
                  <div className="w-full max-w-md bg-zinc-800/50 rounded-lg p-4 mb-6">
                    <div className="flex justify-center gap-6 text-zinc-400">
                      <a
                        href="#"
                        className="hover:text-zinc-100 transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                        <span className="sr-only">Twitter</span>
                      </a>
                      <a
                        href="#"
                        className="hover:text-zinc-100 transition-colors"
                      >
                        <Instagram className="h-5 w-5" />
                        <span className="sr-only">Instagram</span>
                      </a>
                      <a
                        href="#"
                        className="hover:text-zinc-100 transition-colors"
                      >
                        <Github className="h-5 w-5" />
                        <span className="sr-only">GitHub</span>
                      </a>
                      <a
                        href="#"
                        className="hover:text-zinc-100 transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                        <span className="sr-only">LinkedIn</span>
                      </a>
                    </div>
                  </div>

                  <Card className="w-full max-w-md bg-zinc-800/50 border-none">
                    <CardContent className="p-4">
                      <p className="text-zinc-300">
                        Description or about me by John Deo. Here you can write
                        a brief introduction about yourself, your work, or your
                        interests. This is a great place to showcase your
                        personality and connect with your supporters.
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <div className="">
                  <Card className="w-full lg:w-80 border-none bg-zinc-800/50 shadow-lg text-zinc-100">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-center">
                        Support John Deo
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
                          />
                          <span className="flex items-center text-sm">SOL</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="mt-auto py-4 bg-zinc-800">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center text-zinc-400 text-sm">
          <p>All Rights reserved @DAOnation</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-zinc-100 transition-colors">
              <Github />
            </a>
            <span>|</span>
            <a href="#" className="hover:text-zinc-100 transition-colors">
              <X className="font-bold" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
