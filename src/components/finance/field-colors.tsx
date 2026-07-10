// One color per field name, reused across every pattern/bank so the
// same field (e.g. amount) is always the same color no matter which
// bank's message you're looking at — builds a consistent visual vocabulary.
const fieldColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  amount: {
    bg: "bg-blue-500/15",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-500/40",
  },
  totalAmount: {
    bg: "bg-blue-500/15",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-500/40",
  },
  balanceAfter: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/40",
  },
  serviceCharge: {
    bg: "bg-amber-500/15",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-500/40",
  },
  vat: {
    bg: "bg-pink-500/15",
    text: "text-pink-700 dark:text-pink-400",
    border: "border-pink-500/40",
  },
  disasterRecovery: {
    bg: "bg-orange-500/15",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-500/40",
  },
  sender: {
    bg: "bg-teal-500/15",
    text: "text-teal-700 dark:text-teal-400",
    border: "border-teal-500/40",
  },
  senderAccount: {
    bg: "bg-cyan-500/15",
    text: "text-cyan-700 dark:text-cyan-400",
    border: "border-cyan-500/40",
  },
  recipientName: {
    bg: "bg-indigo-500/15",
    text: "text-indigo-700 dark:text-indigo-400",
    border: "border-indigo-500/40",
  },
  recipientPhone: {
    bg: "bg-rose-500/15",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-500/40",
  },
  senderPhone: {
    bg: "bg-rose-500/15",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-500/40",
  },
  tnxID: {
    bg: "bg-lime-500/15",
    text: "text-lime-700 dark:text-lime-400",
    border: "border-lime-500/40",
  },
  date: {
    bg: "bg-slate-500/15",
    text: "text-slate-700 dark:text-slate-400",
    border: "border-slate-500/40",
  },
  time: {
    bg: "bg-slate-500/15",
    text: "text-slate-700 dark:text-slate-400",
    border: "border-slate-500/40",
  },
  reference: {
    bg: "bg-purple-500/15",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-500/40",
  },
};

const fallbackColor = {
  bg: "bg-gray-500/15",
  text: "text-gray-700 dark:text-gray-400",
  border: "border-gray-500/40",
};

export function getFieldColor(name: string) {
  return fieldColors[name] ?? fallbackColor;
}

// Human-readable labels for the field list panel.
export const fieldLabels: Record<string, string> = {
  amount: "Amount",
  totalAmount: "Total Amount",
  balanceAfter: "Balance After",
  serviceCharge: "Service Charge",
  vat: "VAT",
  disasterRecovery: "Disaster Recovery",
  sender: "Sender Name",
  senderAccount: "Sender Account",
  recipientName: "Recipient",
  recipientPhone: "Recipient Phone",
  senderPhone: "Sender Phone",
  tnxID: "Transaction ID",
  date: "Date",
  time: "Time",
  reference: "Reference Link",
};
