import SmsMatchViewer from "@/components/finance/sms-match-viewer";
import { getTransactionReview } from "@/lib/get-transaction-review";

export default async function TransactionsPage() {
  const reviews = await getTransactionReview();

  return (
    <div className="space-y-4 p-4">
      {reviews.map((review) => (
        <SmsMatchViewer key={review.transactionId} review={review} />
      ))}
    </div>
  );
}
