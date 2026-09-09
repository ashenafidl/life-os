"use client";

import { KeyboardIcon } from "@phosphor-icons/react";
import {
  formatForDisplay,
  useHotkeyRegistrations,
} from "@tanstack/react-hotkeys";

import { Kbd } from "@/components/ui/kbd";

export default function HotkeysList() {
  const { hotkeys } = useHotkeyRegistrations();

  const groups = hotkeys.reduce<Record<string, typeof hotkeys>>((acc, reg) => {
    const group = reg.options?.meta?.group ?? "General";

    if (!acc[group]) {
      acc[group] = [];
    }

    acc[group].push(reg);

    return acc;
  }, {});

  const sortedGroups = Object.entries(groups);

  if (!sortedGroups.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted/50 mb-3 flex size-10 items-center justify-center rounded-lg border">
          <KeyboardIcon className="text-muted-foreground size-5" />
        </div>

        <p className="text-sm font-medium">No shortcuts available</p>

        <p className="text-muted-foreground mt-1 text-sm">
          Keyboard shortcuts will appear here when they are registered.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedGroups.map(([group, registrations]) => {
        return (
          <section key={group}>
            <div className="flex items-center gap-2 border-b pb-2">
              <h3 className="text-sm font-semibold">{group}</h3>

              <span className="text-muted-foreground ml-auto text-xs">
                {registrations.length}
              </span>
            </div>

            <div>
              {registrations.map((reg) => {
                const name = reg.options?.meta?.name;
                const description = reg.options?.meta?.description;

                return (
                  <div
                    key={reg.hotkey}
                    className="group/40 flex items-center gap-4 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {name ?? "Unnamed shortcut"}
                      </p>

                      {description && (
                        <p className="text-muted-foreground mt-0.5 truncate text-xs">
                          {description}
                        </p>
                      )}
                    </div>

                    <Kbd>
                      {formatForDisplay(reg.hotkey as never, {
                        useSymbols: true,
                      })}
                    </Kbd>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
