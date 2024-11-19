import { redirect } from "next/navigation";

export const LandingHeader = () => {
  return (
    <header className="max-w-6xl mx-auto w-full p-6 flex justify-between items-center">
      <div
        className="text-2xl font-bold"
        role="button"
        onClick={() => redirect("/")}
      >
        DAOnation
      </div>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <a
              href="/about-us"
              className="hover:text-zinc-300 transition-colors"
            >
              About
            </a>
          </li>
          <li>
            <a
              href="#get-started"
              className="hover:text-zinc-300 transition-colors"
            >
              Get Started
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};
