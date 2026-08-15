"use client";

import {
  DotsThreeVerticalIcon,
  PencilSimpleIcon,
  TrashSimpleIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

import { deleteEvent } from "@/actions/countdown";
import CountdownTimer from "@/components/countdown/countdown-timer";
import EventForm from "@/components/countdown/event-form";
import AppDialog from "@/components/shared/app-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

export default function CountdownCard({
  countdown,
  isPast = false,
}: {
  countdown: { id: string; title: string; date: Date };
  isPast?: boolean;
}) {
  const relation = isPast ? "since" : "until";
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="group relative">
      <Card key={countdown.id} className="w-full">
        <CardHeader className="text-muted-foreground text-center">
          <CardTitle>{countdown.title}</CardTitle>
        </CardHeader>
        <CardContent className="font-heading flex h-full items-center justify-center text-6xl">
          <CountdownTimer date={new Date(countdown.date)} />
        </CardContent>
        <CardFooter className="text-muted-foreground justify-center">
          {`${relation} ${formatDate(countdown.date)}`}
        </CardFooter>
      </Card>

      <div
        className={cn(
          "absolute top-2 right-2 transition-opacity",
          menuOpen
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
        )}
      >
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon">
                <DotsThreeVerticalIcon />
              </Button>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem
                disabled={isPast}
                onClick={() => setEditOpen(true)}
              >
                <PencilSimpleIcon />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <TrashSimpleIcon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <AppDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          title="Edit Event"
        >
          <EventForm event={countdown} />
        </AppDialog>

        <AppDialog
          variant="alert"
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete this event?"
          description={`"${countdown.title}" will be permanently removed. This can't be undone.`}
          confirmLabel="Delete"
          confirmVariant="destructive"
          onConfirm={() => deleteEvent(countdown.id)}
        />
      </div>
    </div>
  );
}
