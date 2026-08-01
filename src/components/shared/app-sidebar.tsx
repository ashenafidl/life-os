"use client";

import { CaretUpDownIcon } from "@phosphor-icons/react";
import { useHotkey } from "@tanstack/react-hotkeys";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import AppDialog from "@/components/shared/app-dialog";
import TaskForm from "@/components/shiplog/task-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { modules, navItems } from "@/constants/module";
import { useIsMobile } from "@/hooks/use-mobile";
import { useModule } from "@/hooks/use-module";
import { Module } from "@/types/module";

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const { open, setOpen, setOpenMobile, openMobile } = useSidebar();

  const { activeModule, setActiveModule } = useModule();

  const items = navItems[activeModule.key] ?? [];

  const toggleSidebar = useCallback(() => {
    return isMobile ? setOpenMobile(!openMobile) : setOpen(!open);
  }, [isMobile, setOpen, setOpenMobile, open, openMobile]);

  useHotkey("Q", () => {
    setTaskDialogOpen(true);
  });
  useHotkey("M", () => {
    toggleSidebar();
  });

  const handleModuleChange = (module: Module) => {
    setActiveModule(module);
    const firstItem = navItems[module.key]?.find(
      (item) => !item.dialog && item.href,
    );
    if (firstItem) router.push(firstItem.href!);
  };

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="bg-primary/5 data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-md border">
                      <activeModule.icon className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {activeModule.name}
                      </span>
                      {activeModule.description && (
                        <span className="text-muted-foreground truncate text-xs">
                          {activeModule.description}
                        </span>
                      )}
                    </div>
                    <CaretUpDownIcon className="ml-auto" />
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-muted-foreground text-xs">
                    Modules
                  </DropdownMenuLabel>
                  {modules.map((module) => (
                    <DropdownMenuItem
                      key={module.name}
                      onClick={() => handleModuleChange(module)}
                      className="gap-2 p-2"
                    >
                      <div className="flex size-8 items-center justify-center rounded-md border">
                        <module.icon className="size-4 shrink-0" />
                      </div>
                      <div>
                        <p>{module.name}</p>
                        <p>
                          {module.description && (
                            <span className="text-muted-foreground truncate text-xs">
                              {module.description}
                            </span>
                          )}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.label}>
                {item.href ? (
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                ) : (
                  <>
                    <SidebarMenuButton
                      type="button"
                      onClick={() => setTaskDialogOpen(true)}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>
                      <Kbd>Q</Kbd>
                    </SidebarMenuBadge>
                  </>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <AppDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        title="New Task"
      >
        <TaskForm />
      </AppDialog>
    </Sidebar>
  );
}
