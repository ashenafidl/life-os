import { Icon } from "@phosphor-icons/react";
import { Route } from "next";

export interface NavItem {
  icon: Icon;
  label: string;
  href: Route;
}
