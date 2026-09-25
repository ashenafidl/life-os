"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface HotkeySheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
}

export const HotkeySheetContext = createContext<HotkeySheetContextValue | null>(
  null,
);

export function HotkeySheetProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => setOpen((prev) => !prev);

  return (
    <HotkeySheetContext.Provider value={{ open, setOpen, toggleOpen }}>
      {children}
    </HotkeySheetContext.Provider>
  );
}

export function useHotkeysSheet() {
  const ctx = useContext(HotkeySheetContext);
  if (!ctx)
    throw new Error(
      "useHotkeysSheet must be used inside a HotkeySheetProvider",
    );
  return ctx;
}
