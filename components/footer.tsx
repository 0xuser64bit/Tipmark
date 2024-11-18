import { Github, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-auto py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center text-zinc-400 text-sm gap-2">
        <p>All Rights reserved @DAOnation</p>
        <div className="flex gap-4">
          <a
            href="#"
            className="hover:text-zinc-100 transition-colors"
            aria-label="GitHub"
          >
            <Github />
          </a>
          <span>|</span>
          <a
            href="#"
            className="hover:text-zinc-100 transition-colors"
            aria-label="Twitter"
          >
            <Twitter />
          </a>
        </div>
      </div>
    </footer>
  );
};
