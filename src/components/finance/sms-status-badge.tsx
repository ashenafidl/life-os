import { Badge } from "@/components/ui/badge";
import { smsStatusEnum } from "@/db/schema/finance";
import { cn } from "@/lib/utils";

type SmsStatus = (typeof smsStatusEnum.enumValues)[number];

const statusConfig: Record<SmsStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-muted text-muted-foreground border-transparent",
  },
  parsed: {
    label: "Parsed",
    className:
      "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
  },
  duplicate: {
    label: "Duplicate",
    className: "bg-sky-500/15 text-sky-600 border-sky-500/30 dark:text-sky-400",
  },
  unmatched: {
    label: "Unmatched",
    className:
      "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400",
  },
};

export default function SmsStatusBadge({ status }: { status: SmsStatus }) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn("font-normal", config.className)}>
      {config.label}
    </Badge>
  );
}
