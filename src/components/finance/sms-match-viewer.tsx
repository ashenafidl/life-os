"use client";

import {
  CalendarIcon,
  TrendDownIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

import FieldList from "@/components/finance/field-list";
import HighlightedBody from "@/components/finance/highlighted-body";
import FormattedDate from "@/components/shared/formatted-date";
import { Card } from "@/components/ui/card";
import { TransactionReview } from "@/lib/get-transaction-review";

export default function SmsMatchViewer({
  review,
}: {
  review: TransactionReview;
}) {
  const [active, setActive] = useState<string>();

  return (
    <Card className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
      <div>
        <p className="text-muted-foreground mb-2 flex items-center gap-2 text-xs tracking-wide uppercase">
          <span>
            {review.transaction.type === "income" ? (
              <TrendUpIcon color="var(--color-green-500)" />
            ) : (
              <TrendDownIcon color="var(--destructive)" />
            )}
          </span>
          <span>
            {review.bankName} - {review.pattern.label}
          </span>
        </p>
        <HighlightedBody
          body={review.body}
          fields={review.fields}
          active={active}
          setActive={setActive}
        />

        <div className="my-12" />

        <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">
          <span>Transaction</span>
        </p>
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} />
          <FormattedDate date={review.transaction.occurredAt ?? ""} />
        </div>
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">
          Extracted Fields
        </p>
        <FieldList
          fields={review.fields}
          active={active}
          setActive={setActive}
        />
      </div>
    </Card>
  );
}
