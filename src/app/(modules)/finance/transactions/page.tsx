import SmsMatchViewer from "@/components/finance/sms-match-viewer";
import { getTransactionReview } from "@/lib/queries/finance";

export default async function TransactionsPage() {
  const reviews = await getTransactionReview();

  return (
    <div className="space-y-4 p-4">
      {reviews.map((review) => (
        <SmsMatchViewer key={review.transaction.id} review={review} />
      ))}
    </div>
  );
}
