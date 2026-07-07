import {
  ArrowsLeftRightIcon,
  BankIcon,
  BarbellIcon,
  SquaresFourIcon,
  TrayIcon,
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
    key: "workouts",
    icon: BarbellIcon,
    name: "Workout tracker",
    description: "Plan your workouts",
  },
];

export const navItems: Record<string, NavItem[]> = {
  finance: [
    { icon: SquaresFourIcon, label: "Dashboard", href: "/dashboard" as Route },
    {
      icon: ArrowsLeftRightIcon,
      label: "Transactions",
      href: "/transactions" as Route,
    },
    { icon: TrayIcon, label: "Inbox", href: "/inbox" as Route },
  ],
  workouts: [
    { icon: BarbellIcon, label: "Workouts", href: "/workouts" as Route },
  ],
};
