"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

interface Props {
  size: "sm" | "default";
}

export default function ThemeSwitcher({ size }: Props) {
  const { theme, setTheme } = useTheme();

  const handleChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    // Browsers without View Transitions support (Firefox, older Safari)
    // just get an instant toggle — no error, no broken animation.
    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    // Anchor the sweep at the exact point clicked, not the screen center.
    const { clientX, clientY } = event;
    document.documentElement.style.setProperty("--sweep-x", `${clientX}px`);
    document.documentElement.style.setProperty("--sweep-y", `${clientY}px`);

    document.startViewTransition(() => {
      setTheme(nextTheme);
    });
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
