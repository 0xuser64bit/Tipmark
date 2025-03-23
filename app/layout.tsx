import type { Metadata } from "next";
import { Sour_Gummy } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import Providers from "./provider";

const font = Sour_Gummy({
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://daonation.com"),
  title: {
    default: "DAOnation",
    template: "%s | DAOnation",
  },
  description:
    "Support your favorite creators in the coolest way using blockchain technology",
  keywords: ["blockchain", "donation", "creators", "web3", "solana", "support"],
  authors: [{ name: "DAOnation Team" }],
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
    title: "DAOnation",
    description:
      "Support your favorite creators in the coolest way using blockchain technology",
    images: [
      {
        url: "/daonation-home.png",
        width: 1200,
        height: 630,
        alt: "DAOnation - Support your favorite creators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DAOnation",
    description:
      "Support your favorite creators in the coolest way using blockchain technology",
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
    <Providers>
      <html lang="en">
        <body className={`${font.className}`}>
          {children}
          <Toaster theme="dark" position="top-center" />
        </body>
      </html>
    </Providers>
  );
}
