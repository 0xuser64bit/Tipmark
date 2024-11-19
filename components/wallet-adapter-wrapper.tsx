"use client";

import { UnifiedWalletProvider } from "@jup-ag/wallet-adapter";

export const WalletAdapterWrapper = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <UnifiedWalletProvider
      wallets={[]}
      config={{
        autoConnect: false,
        env: "devnet",
        metadata: {
          name: "UnifiedWallet",
          description: "UnifiedWallet",
          url: "https://jup.ag",
          iconUrls: ["https://jup.ag/favicon.ico"],
        },
        theme: "jupiter",
        lang: "en",
      }}
    >
      {children}
    </UnifiedWalletProvider>
  );
};
