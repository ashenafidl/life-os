import { getFieldColor } from "@/components/finance/field-colors";
import { cn } from "@/lib/utils";
import { MatchedField } from "@/types/transaction-review";

interface Props {
  body: string;
  fields: MatchedField[];
  active: string | undefined;
  setActive: (value?: string) => void;
}

export default function HighlightedBody({
  body,
  fields,
  active,
  setActive,
}: Props) {
  if (fields.length === 0) {
    return (
      <p className="text-muted-foreground text-sm whitespace-pre-wrap">
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
    <p className="text-sm leading-relaxed whitespace-pre-wrap">
      {segments.map((seg, i) => {
        if (!seg.field) {
          return (
            <span
              // oxlint-disable-next-line react/no-array-index-key
              key={i}
              className={cn(
                "text-muted-foreground",
                active !== undefined && "opacity-30",
              )}
            >
              {seg.text}
            </span>
          );
        }
        const color = getFieldColor(seg.field.name);
        return (
          <span
            key={seg.field.name}
            className={cn(
              "rounded px-0.5 font-medium",
              color.bg,
              color.text,
              active !== seg.field.name && active !== undefined && "opacity-30",
            )}
            onMouseEnter={() => setActive(seg.field?.name)}
            onMouseLeave={() => setActive()}
          >
            {seg.text}
          </span>
        );
      })}
    </p>
  );
}
