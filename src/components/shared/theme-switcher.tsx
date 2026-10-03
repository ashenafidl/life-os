"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

interface Props {
  size: "sm" | "default";
}

export default function ThemeSwitcher({ size }: Props) {
  const { theme, setTheme } = useTheme();

  const toggleThemeWithViewTransition = (
    eventOrCoords:
      | React.MouseEvent<HTMLButtonElement>
      | { x: number; y: number },
  ) => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    let x: number;
    let y: number;

    if ("clientX" in eventOrCoords) {
      // Click event
      x = eventOrCoords.clientX;
      y = eventOrCoords.clientY;
    } else {
      // Fixed coords (e.g. from hotkey)
      x = eventOrCoords.x;
      y = eventOrCoords.y;
    }

    document.documentElement.style.setProperty("--sweep-x", `${x}px`);
    document.documentElement.style.setProperty("--sweep-y", `${y}px`);

    document.startViewTransition(() => {
      setTheme(nextTheme);
    });
  };

  useHotkey(
    "D",
    () =>
      toggleThemeWithViewTransition({
        x: window.innerWidth - 16,
        y: 16,
      }),
    {
      meta: {
        name: "Toggle theme",
        description: "Switch between light and dark mode",
        group: "General",
      },
    },
  );

  const handleChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    toggleThemeWithViewTransition(event);
  };

  return (
    <div>
      <Button
        variant="ghost"
        size={size === "default" ? "icon" : "icon-sm"}
        className="transition-all duration-200"
        onClick={handleChange}
      >
        {theme === "light" ? <MoonIcon /> : <SunIcon />}
      </Button>
    </div>
  );
}
