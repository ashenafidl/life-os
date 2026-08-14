export type FieldType = "text" | "number" | "select" | "date";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FilterFieldConfig {
  key: string;
  label: string;
  type: FieldType;
  options?: FieldOption[]; // only for type: "select"
}

export interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export const OPERATORS_BY_TYPE: Record<FieldType, FieldOption[]> = {
  text: [
    { value: "equals", label: "equals" },
    { value: "contains", label: "contains" },
  ],
  number: [
    { value: "equals", label: "equals" },
    { value: "gt", label: "greater than" },
    { value: "lt", label: "less than" },
  ],
  select: [{ value: "equals", label: "equals" }],
  date: [
    { value: "equals", label: "is" },
    { value: "before", label: "before" },
    { value: "after", label: "after" },
  ],
};

// Fields that don't depend on runtime data (bank list is merged in separately,
// since it has to be fetched from the DB rather than hardcoded here).
const BASE_FILTER_FIELDS: FilterFieldConfig[] = [
  {
    key: "type",
    label: "Type",
    type: "select",
    options: [
      { value: "income", label: "Income" },
      { value: "expense", label: "Expense" },
    ],
  },
  { key: "amount", label: "Amount", type: "number" },
  { key: "occurredAt", label: "Date", type: "date" },
  { key: "recipientName", label: "Recipient", type: "text" },
  { key: "senderName", label: "Sender", type: "text" },
];

export function buildFilterFields(
  bankOptions: FieldOption[],
): FilterFieldConfig[] {
  return [
    { key: "bankId", label: "Bank", type: "select", options: bankOptions },
    ...BASE_FILTER_FIELDS,
  ];
}

export function encodeFilters(filters: FilterCondition[]): string {
  return encodeURIComponent(JSON.stringify(filters));
}

export function decodeFilters(
  raw: string | undefined | null,
): FilterCondition[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (Array.isArray(parsed)) return parsed as FilterCondition[];
  } catch {
    // malformed/tampered query param — treat as no filters rather than crash
  }
  return [];
}
