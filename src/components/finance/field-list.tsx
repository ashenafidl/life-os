import { fieldLabels, getFieldColor } from "@/components/finance/field-colors";
import { cn } from "@/lib/utils";
import { MatchedField } from "@/types/transaction-review";

interface Props {
  fields: MatchedField[];
  active: string | undefined;
  setActive: (value?: string) => void;
}

export default function FieldList({ fields, active, setActive }: Props) {
  if (fields.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No fields were extracted.</p>
    );
  }

  return (
    <dl className="space-y-2">
      {fields.map((field) => {
        const color = getFieldColor(field.name);

        return (
          <div
            key={field.name}
            className={cn(
              "flex items-center justify-between rounded-md border px-3 py-1.5",
              color.border,
              color.bg,
              active !== field.name && active !== undefined && "opacity-30",
            )}
            onMouseEnter={() => setActive(field.name)}
            onMouseLeave={() => setActive()}
          >
            <dt className={`text-xs font-medium ${color.text}`}>
              {fieldLabels[field.name] ?? field.name}
            </dt>
            <dd className="text-sm font-medium">{field.value}</dd>
          </div>
        );
      })}
    </dl>
  );
}
