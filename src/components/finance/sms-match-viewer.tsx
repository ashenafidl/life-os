"use client";

import { TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react";
import { useState } from "react";

import FieldList from "@/components/finance/field-list";
import HighlightedBody from "@/components/finance/highlighted-body";
import { Card } from "@/components/ui/card";
import { TransactionReview } from "@/types/transaction-review";

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
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">
          Extracted Fields
        </p>
        <FieldList
          transaction={review.transaction}
          active={active}
          setActive={setActive}
        />
      </div>
    </Card>
  );
}
