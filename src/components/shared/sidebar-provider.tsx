import { cookies } from "next/headers";

import AppSidebar from "@/components/shared/app-sidebar";
import TopNavbar from "@/components/shared/top-navbar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function AppSidebarProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const sidebar_state = cookieStore.get("sidebar_state");

  return (
    <SidebarProvider defaultOpen={sidebar_state?.value === "true"}>
      <AppSidebar />
      <main className="w-full overflow-auto">
        <TopNavbar />
        {children}
      </main>
    </SidebarProvider>
  );
}
