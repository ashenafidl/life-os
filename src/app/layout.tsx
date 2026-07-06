import "./globals.css";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import type { Metadata } from "next";
import { Figtree, Lora } from "next/font/google";

import BreakpointIndicator from "@/components/shared/breakpoint-indicator";
import ThemeProvider from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ModuleProvider } from "@/context/module-context";
import { cn } from "@/lib/utils";

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
              {children}

              <TanStackDevtools
                plugins={[
                  { name: "Tanstack Form", render: <FormDevtoolsPanel /> },
                ]}
              />
              <BreakpointIndicator />
            </ModuleProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
