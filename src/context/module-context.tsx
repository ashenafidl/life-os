"use client";

import { usePathname } from "next/navigation";
import { createContext, ReactNode, useEffect, useState } from "react";

import { modules, navItems } from "@/constants/module";
import { Module } from "@/types/module";

interface ModuleContextValue {
  activeModule: Module;
  setActiveModule: (module: Module) => void;
}

export const ModuleContext = createContext<ModuleContextValue | null>(null);

function moduleForPath(pathname: string): Module {
  return (
    modules.find((module) =>
      navItems[module.key]?.some((item) => item.href === pathname),
    ) ?? modules[0]
  );
}

export function ModuleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [activeModule, setActiveModule] = useState<Module>(() =>
    moduleForPath(pathname),
  );

  // Keep the sidebar in sync with whatever route we're actually on —
  // covers direct links, browser back/forward, and the home page's
  // own router.push, without every call site needing to remember to
  // call setActiveModule itself.
  useEffect(() => {
    const match = moduleForPath(pathname);
    if (match.key !== activeModule.key) {
      setActiveModule(match);
    }
    // activeModule intentionally omitted — this effect should only react to route changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <ModuleContext.Provider value={{ activeModule, setActiveModule }}>
      {children}
    </ModuleContext.Provider>
  );
}
