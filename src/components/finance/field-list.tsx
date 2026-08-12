import { format } from "date-fns";
import { ReactNode } from "react";

import { fieldLabels, getFieldColor } from "@/components/finance/field-colors";
import { transactions } from "@/db/schema/finance";
import formatMoney from "@/lib/money-utils";
import { cn } from "@/lib/utils";

type Transaction = typeof transactions.$inferSelect;

interface FieldMapping {
  column: keyof Transaction;
  sourceField: string;
  label?: string;
  render?: (transaction: Transaction) => ReactNode;
}

const MAPPINGS: FieldMapping[] = [
  { column: "tnxId", sourceField: "tnxID" },
  { column: "senderName", sourceField: "senderName" },
  { column: "senderAccount", sourceField: "senderAccount" },
  { column: "senderPhone", sourceField: "senderPhone" },
  { column: "recipientName", sourceField: "recipientName" },
  { column: "recipientAccount", sourceField: "recipientAccount" },
  { column: "recipientPhone", sourceField: "recipientPhone" },
  {
    column: "amount",
    sourceField: "amount",
    render: (t) => formatMoney(t.amount, { compact: false }),
  },
  {
    column: "vat",
    sourceField: "vat",
    render: (t) => formatMoney(t.vat, { compact: false }),
  },
  {
    column: "serviceCharge",
    sourceField: "serviceCharge",
    render: (t) => formatMoney(t.serviceCharge, { compact: false }),
  },
  {
    column: "disasterRecovery",
    sourceField: "disasterRecovery",
    render: (t) => formatMoney(t.disasterRecovery, { compact: false }),
  },
  {
    column: "totalAmount",
    sourceField: "totalAmount",
    render: (t) => formatMoney(t.totalAmount, { compact: false }),
  },
  {
    column: "balanceAfter",
    sourceField: "balanceAfter",
    render: (t) => formatMoney(t.balanceAfter, { compact: false }),
  },
  {
    column: "reference",
    sourceField: "reference",
    render: (t) =>
      t.reference ? (
        <a href={t.reference} className="underline decoration-dotted">
          {t.reference}
        </a>
      ) : (
        "-"
      ),
  },
  {
    column: "occurredAt",
    sourceField: "date",
    label: "Occurred At",
    render: (t) =>
      t.occurredAt ? format(t.occurredAt, "MMMM d, yyyy 'at' HH:mm:ss") : "—",
  },
];

interface Props {
  transaction: Transaction;
  active: string | undefined;
  setActive: (value?: string) => void;
}

export default function FieldList({ transaction, active, setActive }: Props) {
  return (
    <dl className="space-y-2">
      {MAPPINGS.map(({ column, sourceField, label, render }) => {
        const color = getFieldColor(sourceField);
        const value = render
          ? render(transaction)
          : (transaction[column] ?? "—");

        return (
          <div
            key={column}
            className={cn(
              "flex items-center justify-between border-l-3 px-2",
              color.border,
              active !== sourceField && active !== undefined && "opacity-30",
            )}
            onMouseEnter={() => setActive(sourceField)}
            onMouseLeave={() => setActive()}
          >
            <dt className="text-xs font-medium">
              {label ?? fieldLabels[sourceField]}
            </dt>
            <dd className="text-sm font-medium">{value as ReactNode}</dd>
          </div>
        );
      })}
    </dl>
  );
}
