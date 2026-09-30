import "./globals.css";
import { cn } from "cn";
import type { Metadata } from "next";
import { Figtree, IBM_Plex_Mono, Lora } from "next/font/google";

import AddTransactionDialog from "@/components/finance/transactions/add-transaction-dialog";
import BreakpointIndicator from "@/components/shared/breakpoint-indicator";
import HotkeysSheet from "@/components/shared/hotkeys-sheet";
import ThemeProvider from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HotkeySheetProvider } from "@/context/hotkey-sheet-context";
import { ModuleProvider } from "@/context/module-context";

const DevTools: React.ComponentType =
  process.env.NODE_ENV === "development"
    ? (await import("@/components/dev-tools")).default
    : () => null;

const loraHeading = Lora({ subsets: ["latin"], variable: "--font-heading" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LifeOS",
  description: "Organize your life.",
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
        ibmPlexMono.variable,
      )}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <ModuleProvider>
              <HotkeySheetProvider>
                {children}

                <AddTransactionDialog />
                <HotkeysSheet />
                <DevTools />
                <BreakpointIndicator />
              </HotkeySheetProvider>
            </ModuleProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
