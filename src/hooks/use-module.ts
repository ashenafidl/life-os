import { useContext } from "react";

import { ModuleContext } from "@/context/module-context";

export function useModule() {
  const ctx = useContext(ModuleContext);
  if (!ctx) throw new Error("useModule must be used inside a ModuleProvider");
  return ctx;
}
