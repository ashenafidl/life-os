import { fieldLabels, getFieldColor } from "@/components/finance/field-colors";
import { MatchedField } from "@/lib/get-transaction-review";

export default function FieldList({ fields }: { fields: MatchedField[] }) {
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
            className={`flex items-center justify-between rounded-md border px-3 py-1.5 ${color.border} ${color.bg}`}
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
