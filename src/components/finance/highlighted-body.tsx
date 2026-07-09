import { fieldLabels, getFieldColor } from "@/components/finance/field-colors";
import { MatchedField } from "@/lib/get-transaction-review";

export default function HighlightedBody({
  body,
  fields,
}: {
  body: string;
  fields: MatchedField[];
}) {
  if (fields.length === 0) {
    return (
      <p className="text-muted-foreground font-mono text-sm whitespace-pre-wrap">
        {body}
      </p>
    );
  }

  // Build alternating plain/highlighted text segments by walking the
  // sorted field ranges and filling the gaps between them.
  const segments: { text: string; field?: MatchedField }[] = [];
  let cursor = 0;

  for (const field of fields) {
    if (field.start > cursor) {
      segments.push({ text: body.slice(cursor, field.start) });
    }
    segments.push({ text: body.slice(field.start, field.end), field });
    cursor = field.end;
  }
  if (cursor < body.length) {
    segments.push({ text: body.slice(cursor) });
  }

  return (
    <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
      {segments.map((seg, i) => {
        if (!seg.field) {
          return (
            // oxlint-disable-next-line react/no-array-index-key
            <span key={i} className="text-muted-foreground">
              {seg.text}
            </span>
          );
        }
        const color = getFieldColor(seg.field.name);
        return (
          <span
            // oxlint-disable-next-line react/no-array-index-key
            key={i}
            title={fieldLabels[seg.field.name] ?? seg.field.name}
            className={`rounded px-0.5 font-medium ${color.bg} ${color.text}`}
          >
            {seg.text}
          </span>
        );
      })}
    </p>
  );
}
