import "./globals.css";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import type { Metadata } from "next";
import { Figtree, Lora } from "next/font/google";

import AppSidebar from "@/components/shared/app-sidebar";
import BreakpointIndicator from "@/components/shared/breakpoint-indicator";
import TopNavbar from "@/components/shared/top-navbar";
import ThemeProvider from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
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
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <SidebarProvider>
              <AppSidebar />
              <main className="w-full">
                <TopNavbar />
                {children}

                <TanStackDevtools
                  plugins={[
                    { name: "Tanstack Form", render: <FormDevtoolsPanel /> },
                  ]}
                />
                <BreakpointIndicator />
              </main>
            </SidebarProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
