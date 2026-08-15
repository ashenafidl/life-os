"use client";

import { VariantProps } from "class-variance-authority";
import {
  createContext,
  type ReactElement,
  type ReactNode,
  useContext,
  useState,
} from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
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
  trigger?: ReactNode;
  title: string;
  description?: string;
  children?: ReactNode;
  open?: boolean;
  variant?: "dialog" | "alert";
  onOpenChange?: (open: boolean) => void;
  confirmLabel?: string;
  onConfirm?: () => void;
  confirmVariant?: VariantProps<typeof buttonVariants>["variant"];
}

export default function AppDialog({
  trigger,
  title,
  description,
  children,
  open,
  variant = "dialog",
  onOpenChange,
  confirmLabel = "Continue",
  onConfirm,
  confirmVariant = "default",
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const close = () => setOpen(false);

  const body = (
    <DialogCloseContext.Provider value={close}>
      {children}
    </DialogCloseContext.Provider>
  );

  if (variant === "alert") {
    return (
      <AlertDialog open={isOpen} onOpenChange={setOpen}>
        {trigger && (
          <AlertDialogTrigger
            render={trigger as ReactElement}
            nativeButton={false}
          />
        )}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            {description && (
              <AlertDialogDescription>{description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant={confirmVariant} onClick={onConfirm}>
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger render={trigger as ReactElement} nativeButton={false} />
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}
