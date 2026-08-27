import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import "./globals.css";
import { BRAND_HANDLE, BRAND_NAME, BRAND_URL } from "@/lib/brand";

/* Three voices. Sans is the interface, mono is the machine, serif is the
   person. See app/globals.css for the reasoning. */

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

const newsreader = localFont({
  src: [
    {
      path: "./fonts/Newsreader-Roman.woff2",
      style: "normal",
      weight: "200 800",
    },
    {
      path: "./fonts/Newsreader-Italic.woff2",
      style: "italic",
      weight: "200 800",
    },
  ],
  variable: "--font-newsreader",
  display: "swap",
  fallback: ["Iowan Old Style", "Palatino Linotype", "Georgia", "serif"],
});

const TITLE = `${BRAND_NAME} — a tip jar that prints receipts`;
const DESCRIPTION =
  "Claim a link, share it, and receive SOL straight to your own wallet. No account holds it for you, no cut is taken, and every contribution leaves a receipt on Solana.";

export const metadata: Metadata = {
  metadataBase: new URL(BRAND_URL),
  title: { default: TITLE, template: `%s · ${BRAND_NAME}` },
  description: DESCRIPTION,
  keywords: [
    "solana",
    "crypto tip jar",
    "support creators",
    "buy me a coffee alternative",
    "non-custodial donations",
    "SOL payments",
  ],
  authors: [{ name: BRAND_NAME }],
  creator: BRAND_NAME,
  publisher: BRAND_NAME,
  formatDetection: { email: false, telephone: false, address: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: BRAND_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/opengraph-image"],
    creator: BRAND_HANDLE,
    site: BRAND_HANDLE,
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
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-paper text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-sm focus:border focus:border-ink focus:bg-sheet focus:px-3 focus:py-2 focus:text-sm focus:font-medium"
        >
          Skip to content
        </a>
        {children}
        <Toaster
          position="bottom-right"
          gap={10}
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                "flex w-full items-start gap-2.5 border border-rule bg-sheet px-3.5 py-3 text-[13.5px] leading-snug text-ink shadow-lifted rounded-[4px]",
              title: "font-medium",
              description: "text-ink-faint",
              icon: "mt-px shrink-0 [&>svg]:size-4",
              success: "[&_svg]:text-stamp",
              error: "[&_svg]:text-seal",
              closeButton: "border-rule bg-sheet text-ink-faint hover:text-ink",
            },
          }}
        />
      </body>
    </html>
  );
}
