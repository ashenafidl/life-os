"use client";

import ThemeSwitcher from "@/components/shared/theme-switcher";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export default function TopNavbar() {
  const { open } = useSidebar();

  return (
    <div
      className={cn(
        "flex h-12 flex-row items-center justify-between border-b px-4 transition-all duration-200",
        open && "h-16",
      )}
    >
      <SidebarTrigger />
      <ThemeSwitcher size={open ? "default" : "sm"} />
    </div>
  );
}
