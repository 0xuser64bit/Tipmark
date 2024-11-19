import { Github, Twitter } from "lucide-react";

export const LandingFooter = () => {
  return (
    <footer className="max-w-6xl mx-auto w-full p-6 flex justify-between items-center border-t border-zinc-800">
      <p className="text-sm text-zinc-400">
        © {new Date().getFullYear()} DAOnation. All rights reserved.
      </p>
      <div className="flex space-x-4">
        <a
          href="https://x.com/user64bit"
          className="text-zinc-400 hover:text-zinc-100 transition-colors"
          target="_blank"
        >
          <Twitter className="h-5 w-5" />
          <span className="sr-only">Twitter</span>
        </a>
        <a
          href="https://github.com/user-64bit"
          className="text-zinc-400 hover:text-zinc-100 transition-colors"
          target="_blank"
        >
          <Github className="h-5 w-5" />
          <span className="sr-only">GitHub</span>
        </a>
      </div>
    </footer>
  );
};
