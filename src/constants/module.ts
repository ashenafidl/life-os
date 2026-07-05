import {
  BankIcon,
  BarbellIcon,
  CalendarDotsIcon,
  ChecksIcon,
  HouseIcon,
  KanbanIcon,
} from "@phosphor-icons/react";
import { Route } from "next";

import { Module } from "@/types/module";
import { NavItem } from "@/types/nav";

export const modules: Module[] = [
  {
    key: "tasks",
    icon: ChecksIcon,
    name: "Tasks",
    description: "Manage your todos and tasks",
  },
  {
    key: "expenses",
    icon: BankIcon,
    name: "Expenses",
    description: "Track your transactions",
  },
  {
    key: "workouts",
    icon: BarbellIcon,
    name: "Workout tracker",
    description: "Plan your workouts",
  },
  {
    key: "habits",
    icon: CalendarDotsIcon,
    name: "Habits",
    description: "Stay consistent",
  },
];

export const navItems: Record<string, NavItem[]> = {
  tasks: [
    { icon: HouseIcon, label: "Home", href: "/tasks" as Route },
    { icon: KanbanIcon, label: "Projects", href: "/projects" as Route },
  ],
  expenses: [{ icon: BankIcon, label: "Accounts", href: "/expenses" as Route }],
  workouts: [
    { icon: BarbellIcon, label: "Workouts", href: "/workouts" as Route },
  ],
  habits: [
    { icon: CalendarDotsIcon, label: "Habits", href: "/habits" as Route },
  ],
};
