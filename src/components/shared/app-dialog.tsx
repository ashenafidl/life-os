"use client";

import { createContext, ReactNode, useContext, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DialogCloseContext = createContext<(() => void) | null>(null);

// Any client-side descendant (e.g. a form) calls this to close the dialog
// after a successful submit, without needing `close` passed as a prop.
export function useDialogClose() {
  const close = useContext(DialogCloseContext);
  if (!close)
    throw new Error("useDialogClose must be used inside an AppDialog");
  return close;
}

interface Props {
  trigger: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}

export default function AppDialog({
  trigger,
  title,
  description,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={trigger as React.ReactElement}
        nativeButton={false}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogCloseContext.Provider value={close}>
          {children}
        </DialogCloseContext.Provider>
      </DialogContent>
    </Dialog>
  );
}
