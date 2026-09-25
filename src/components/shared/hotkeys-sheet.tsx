"use client";

import { getHotkeyManager } from "@tanstack/react-hotkeys";
import { useEffect } from "react";

import HotkeysList from "@/components/shared/hotkeys-list";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useHotkeysSheet } from "@/context/hotkey-sheet-context";

export default function HotkeysSheet() {
  const { open, setOpen, toggleOpen } = useHotkeysSheet();

  useEffect(() => {
    const handle = getHotkeyManager().register("I", toggleOpen, {
      meta: {
        name: "Shortcuts Helper",
        description: "Open keyboard shortcuts help",
        group: "General",
      },
    });

    return () => {
      handle.unregister();
    };
  }, [toggleOpen]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>Keyboard shortcuts</SheetTitle>
          <SheetDescription>
            A list of all the keyboard shortcuts available in the app.
          </SheetDescription>
        </SheetHeader>

        <div className="no-scrollbar overflow-y-auto px-4">
          <HotkeysList />
        </div>
      </SheetContent>
    </Sheet>
  );
}
