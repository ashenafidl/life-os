import { z } from "zod";

import { transactionTypeEnum } from "@/db/schema/finance";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(60),
  description: z.string().trim().max(240),
  type: z.enum(transactionTypeEnum.enumValues),
  color: z.string().regex(/^#[\da-fA-F]{6}$/, "Choose a valid hex color."),
  icon: z.string().trim().max(40),
});

export type CategoryInput = z.infer<typeof categorySchema>;
