import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import "./globals.css";
import Providers from "./provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://daonation.xyz"),
  title: {
    default: "DAOnation — Get paid in crypto, keep all of it",
    template: "%s · DAOnation",
  },
  description:
    "DAOnation is the crypto-native way to get supported. Claim your link, share it, and receive SOL directly to your wallet — non-custodial and verifiable on Solana.",
  keywords: [
    "solana",
    "crypto donations",
    "web3",
    "support creators",
    "buy me a coffee",
    "tip jar",
    "blockchain",
  ],
  authors: [{ name: "DAOnation" }],
  creator: "DAOnation",
  publisher: "DAOnation",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "DAOnation",
    title: "DAOnation — Get paid in crypto, keep all of it",
    description:
      "Claim your link, share it, get supported in SOL — directly, with near-zero fees, verifiable on Solana.",
    images: [
      {
        url: "/daonation-home.png",
        width: 1200,
        height: 630,
        alt: "DAOnation — get paid in crypto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DAOnation — Get paid in crypto, keep all of it",
    description:
      "Claim your link, share it, get supported in SOL — directly, with near-zero fees, verifiable on Solana.",
    images: ["/daonation-home.png"],
    creator: "@DAOnation",
    site: "@DAOnation",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/daonation.png",
    shortcut: "/daonation.png",
    apple: "/daonation.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          {children}
          <Toaster
            theme="dark"
            position="top-center"
            toastOptions={{
              style: {
                background: "#16161d",
                border: "1px solid #23232b",
                color: "#fafafa",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
