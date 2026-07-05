import z from "zod";

export function isFieldRequired(schema: z.ZodSchema, path: string): boolean {
  const parts = path.split(".");

  let current: z.ZodTypeAny = schema;

  for (const part of parts) {
    if (current instanceof z.ZodObject) {
      const shape = current.shape;
      current = shape[part];
    } else {
      return false;
    }

    if (!current) return false;
  }

  if (!current) return false;

  const { success: undefinedAllowed } = current.safeParse(undefined);
  const { success: emptyStringAllowed } = current.safeParse("");

  return !undefinedAllowed && !emptyStringAllowed;
}
