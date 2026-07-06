"use client";

import { LinkSimpleIcon } from "@phosphor-icons/react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

export default function DataTableLinkCell({ href }: { href: string }) {
  if (!href) return <span className="text-muted-foreground">-</span>;

  return (
    <HoverCard>
      <HoverCardTrigger
        delay={0}
        closeDelay={0}
        render={
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "text-muted-foreground hover:text-foreground inline-flex max-w-96 items-center gap-1.5 align-middle transition-colors",
            )}
          >
            <LinkSimpleIcon className="size-4 shrink-0" />
          </a>
        }
      />
      <HoverCardContent side="top">{href}</HoverCardContent>
    </HoverCard>
  );
}
