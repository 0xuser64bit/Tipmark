import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    /* `/dashboard` and `/home` were the creator routes until their names were
       swapped to match what they show. Both were linkable, and `/[username]`
       would otherwise resolve them as handles, so they redirect permanently
       rather than 404. */
    return [
      { source: "/dashboard", destination: "/ledger", permanent: true },
      { source: "/home", destination: "/me", permanent: true },
    ];
  },
};

export default nextConfig;
