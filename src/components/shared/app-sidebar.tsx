"use client";

import { CaretUpDownIcon, ChecksIcon, Icon } from "@phosphor-icons/react";
import { HouseIcon, KanbanIcon } from "@phosphor-icons/react";
import { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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

interface NavItem {
  icon: Icon;
  label: string;
  href: Route;
}

interface Module {
  icon: Icon;
  name: string;
  description?: string;
}

const modules: Module[] = [
  {
    icon: ChecksIcon,
    name: "Tasks",
    description: "Manage your todos and tasks.",
  },
];

export default function AppSidebar() {
  const pathname = usePathname();

  const [activeModule, setActiveModule] = useState<Module>(modules[0]);

  const items: NavItem[] = [
    {
      icon: HouseIcon,
      label: "Home",
      href: "/",
    },
    {
      icon: KanbanIcon,
      label: "Projects",
      href: "/projects",
    },
  ];

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
                    className="bg-sidebar-accent/50 data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
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
                      onClick={() => setActiveModule(module)}
                      className="gap-2 p-2"
                    >
                      <div className="flex size-6 items-center justify-center rounded-md border">
                        <module.icon className="size-3.5 shrink-0" />
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
