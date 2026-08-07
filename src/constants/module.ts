import {
  ArrowsLeftRightIcon,
  BankIcon,
  BarbellIcon,
  ClockCountdownIcon,
  NotepadIcon,
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
    key: "shiplog",
    icon: NotepadIcon,
    name: "ShipLog",
    description: "Track your ship logs",
  },
  {
    key: "countdown",
    icon: ClockCountdownIcon,
    name: "Countdown",
    description: "Track you important days",
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
    { icon: TrayIcon, label: "Inbox", href: "/finance/inbox" as Route },
  ],
  shiplog: [{ icon: NotepadIcon, label: "Shiplog", href: "/shiplog" as Route }],
  countdown: [
    {
      icon: ClockCountdownIcon,
      label: "Countdown",
      href: "/countdown" as Route,
    },
  ],
  workouts: [
    { icon: BarbellIcon, label: "Workouts", href: "/workouts" as Route },
  ],
};
