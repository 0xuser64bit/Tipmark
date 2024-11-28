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
  title: "DAOnation",
  description: "Support your favorite creator in coolest way",
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
