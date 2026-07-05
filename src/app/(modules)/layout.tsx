import AppSidebar from "@/components/shared/app-sidebar";
import TopNavbar from "@/components/shared/top-navbar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function ModuleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <TopNavbar />
        {children}
      </main>
    </SidebarProvider>
  );
}
