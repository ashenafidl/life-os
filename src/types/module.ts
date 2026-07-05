import { Icon } from "@phosphor-icons/react";

export interface Module {
  key: string;
  icon: Icon;
  name: string;
  description?: string;
}
