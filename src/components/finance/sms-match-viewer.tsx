"use client";

import { useState } from "react";

import FieldList from "@/components/finance/field-list";
import HighlightedBody from "@/components/finance/highlighted-body";
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
        <p className="text-muted-foreground mb-2 text-xs tracking-wide uppercase">
          {review.bankName} - Raw Message
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
          fields={review.fields}
          active={active}
          setActive={setActive}
        />
      </div>
    </Card>
  );
}
