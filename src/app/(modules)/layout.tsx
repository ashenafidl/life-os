import { Suspense } from "react";

import AppSidebarProvider from "@/components/shared/sidebar-provider";

export default async function ModuleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center text-6xl">
          Loading...
        </div>
      }
    >
      <AppSidebarProvider>{children}</AppSidebarProvider>;
    </Suspense>
  );
}
