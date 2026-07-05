"use client";

import { CaretUpDownIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { modules, navItems } from "@/constants/module";
import { useModule } from "@/hooks/use-module";
import { Module } from "@/types/module";

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { activeModule, setActiveModule } = useModule();

  const items = navItems[activeModule.key] ?? [];

  const handleModuleChange = (module: Module) => {
    setActiveModule(module);
    const firstItem = navItems[module.key]?.[0];
    if (firstItem) router.push(firstItem.href);
  };

  return (
    <Sidebar collapsible="icon">
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
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={pathname === item.href}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
