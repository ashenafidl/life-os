import "./globals.css";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import { HotkeysDevtoolsPanel } from "@tanstack/react-hotkeys-devtools";
import type { Metadata } from "next";
import { Figtree, IBM_Plex_Mono, Lora } from "next/font/google";

import BreakpointIndicator from "@/components/shared/breakpoint-indicator";
import ThemeProvider from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ModuleProvider } from "@/context/module-context";
import { cn } from "@/lib/utils";

const loraHeading = Lora({ subsets: ["latin"], variable: "--font-heading" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

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
              {children}

              <TanStackDevtools
                plugins={[
                  { name: "Tanstack Form", render: <FormDevtoolsPanel /> },
                  {
                    name: "Tanstack Hotkeys",
                    render: (
                      <HotkeysDevtoolsPanel
                        theme="light"
                        devtoolsOpen={false}
                      />
                    ),
                  },
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
