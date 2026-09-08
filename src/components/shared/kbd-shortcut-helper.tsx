"use client";

import { useHotkey } from "@tanstack/react-hotkeys";
import { useState } from "react";

import KbdShortcutsList from "@/components/shared/kbd-shortcuts-list";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function KbdShortcutHelper() {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    setOpen((prev) => !prev);
  };

  useHotkey("I", () => toggleOpen(), {
    meta: {
      name: "Shortcuts Helper",
      description: "Open keyboard shortcuts help",
      group: "General",
    },
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Keyboard shortcuts</SheetTitle>
          <SheetDescription>
            A list of all the keyboard shortcuts available in the app.
          </SheetDescription>
        </SheetHeader>

        <div className="no-scrollbar overflow-y-auto px-4">
          <KbdShortcutsList />
        </div>
      </SheetContent>
    </Sheet>
  );
}
