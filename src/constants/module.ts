import {
  ArrowsLeftRightIcon,
  BankIcon,
  ClockCountdownIcon,
  TagIcon,
  SquaresFourIcon,
  TrayIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { Route } from "next";

import { Module } from "@/types/module";
import { NavItem } from "@/types/nav";

export const modules: Module[] = [
  {
    key: "finance",
    icon: BankIcon,
    name: "Finance",
    description: "Track your transactions",
  },

  {
    key: "countdown",
    icon: ClockCountdownIcon,
    name: "Countdown",
    description: "Track you important days",
  },
];

export const navItems: Record<string, NavItem[]> = {
  finance: [
    {
      icon: SquaresFourIcon,
      label: "Dashboard",
      href: "/finance/dashboard" as Route,
    },
    {
      icon: ArrowsLeftRightIcon,
      label: "Transactions",
      href: "/finance/transactions" as Route,
    },
    { icon: UsersIcon, label: "Peoples", href: "/finance/peoples" as Route },
    {
      icon: TagIcon,
      label: "Categories",
      href: "/finance/categories" as Route,
    },
    { icon: TrayIcon, label: "Inbox", href: "/finance/inbox" as Route },
  ],
  countdown: [
    {
      icon: ClockCountdownIcon,
      label: "Countdown",
      href: "/countdown" as Route,
    },
  ],
};
