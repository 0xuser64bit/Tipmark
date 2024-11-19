import { Github, Instagram, Linkedin, Twitter } from "lucide-react";

export const SocialsCard = ({
  x_username,
  instagram_username,
  github_username,
  linkedin_username,
}: {
  x_username: string;
  instagram_username: string;
  github_username: string;
  linkedin_username: string;
}) => {
  return (
    <div className="w-full bg-zinc-800/50 rounded-lg p-4">
      <div className="flex justify-center gap-6 text-zinc-400">
        <a
          href={"https://x.com/" + x_username}
          className="hover:text-zinc-100 transition-colors"
          aria-label="Twitter"
          target="_blank"
        >
          <Twitter className="h-5 w-5" />
        </a>
        <a
          href={"https://instagram.com/" + instagram_username}
          className="hover:text-zinc-100 transition-colors"
          aria-label="Instagram"
          target="_blank"
        >
          <Instagram className="h-5 w-5" />
        </a>
        <a
          href={"https://github.com/" + github_username}
          className="hover:text-zinc-100 transition-colors"
          aria-label="GitHub"
          target="_blank"
        >
          <Github className="h-5 w-5" />
        </a>
        <a
          href={"https://linkedin.com/" + linkedin_username}
          className="hover:text-zinc-100 transition-colors"
          aria-label="LinkedIn"
          target="_blank"
        >
          <Linkedin className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
};
