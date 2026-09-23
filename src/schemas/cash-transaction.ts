import { z } from "zod";

const amountPattern = /^\d+(\.\d{1,2})?$/;

export const cashTnxSchema = z.object({
  amount: z
    .string()
    .regex(amountPattern, "Enter a valid amount with up to 2 decimals")
    .refine((value) => Number(value) > 0, "Amount must be greater than zero."),
  occurredAt: z.date(),
  type: z.enum(["income", "expense"], {
    error: "Select a transaction type.",
  }),
});

export type CashTnxInput = z.infer<typeof cashTnxSchema>;
