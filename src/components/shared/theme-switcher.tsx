"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

interface Props {
  size: "sm" | "default";
}

export default function ThemeSwitcher({ size }: Props) {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <Button
        variant="ghost"
        size={size === "default" ? "icon" : "icon-sm"}
        className="transition-all duration-200"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? <MoonIcon /> : <SunIcon />}
      </Button>
    </div>
  );
}
