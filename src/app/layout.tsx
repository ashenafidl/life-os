import type { Metadata } from "next";
import { Figtree, Lora } from "next/font/google";

import { cn } from "@/lib/utils";

import "./globals.css";

const loraHeading = Lora({ subsets: ["latin"], variable: "--font-heading" });

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "LifeOS",
  description: "Organization your life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "antialiased",
        "font-sans",
        figtree.variable,
        loraHeading.variable,
      )}
    >
      <body>{children}</body>
    </html>
  );
}
