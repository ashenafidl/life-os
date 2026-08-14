"use client";

import { PlusIcon, XIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FilterCondition,
  FilterFieldConfig,
  OPERATORS_BY_TYPE,
} from "@/lib/filters";

interface Props {
  conditions: FilterCondition[];
  fields: FilterFieldConfig[];
  onChange: (filters: FilterCondition[]) => void;
  onClear: () => void;
}

export default function FilterEditor({
  conditions,
  fields,
  onChange,
  onClear,
}: Props) {
  const addCondition = () => {
    const first = fields[0];
    onChange([
      ...conditions,
      {
        id: crypto.randomUUID(),
        field: first.key,
        operator: OPERATORS_BY_TYPE[first.type][0].value,
        value: "",
      },
    ]);
  };

  const updateCondition = (id: string, patch: Partial<FilterCondition>) => {
    onChange(conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const removeCondition = (id: string) => {
    onChange(conditions.filter((c) => c.id !== id));
  };

  return (
    <div className="bg-popover flex flex-wrap items-stretch gap-x-6 gap-y-3 p-4 rounded-xl">
      <div className="flex flex-col gap-2">
        {conditions.map((condition, index) => {
          const fieldConfig =
            fields.find((f) => f.key === condition.field) ?? fields[0];
          const operators = OPERATORS_BY_TYPE[fieldConfig.type];

          return (
            <div key={condition.id} className="flex items-center gap-2">
              <Button
                variant="secondary"
                className="size-8 shrink-0"
                onClick={() => removeCondition(condition.id)}
                aria-label="Remove filter"
              >
                <XIcon />
              </Button>

              <div className="text-muted-foreground bg-muted flex h-8 w-16 shrink-0 items-center justify-center rounded-md text-sm">
                {index === 0 ? "where" : "and"}
              </div>

              <Select
                items={fields.map((f) => ({ label: f.label, value: f.key }))}
                value={condition.field}
                onValueChange={(key) => {
                  const next = fields.find((f) => f.key === key) ?? fields[0];
                  updateCondition(condition.id, {
                    field: key ?? undefined,
                    operator: OPERATORS_BY_TYPE[next.type][0].value,
                    value: "",
                  });
                }}
              >
                <SelectTrigger className="h-8! min-w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {fields.map((f) => (
                      <SelectItem key={f.key} value={f.key}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select
                value={condition.operator}
                onValueChange={(value) =>
                  updateCondition(condition.id, {
                    operator: value ?? undefined,
                  })
                }
              >
                <SelectTrigger className="h-8! w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {operators.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {fieldConfig.type === "select" ? (
                <Select
                  items={fieldConfig.options}
                  value={condition.value}
                  onValueChange={(value) =>
                    updateCondition(condition.id, { value: value ?? undefined })
                  }
                >
                  <SelectTrigger className="h-8! min-w-40">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {fieldConfig.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={
                    fieldConfig.type === "number"
                      ? "number"
                      : fieldConfig.type === "date"
                        ? "date"
                        : "text"
                  }
                  value={condition.value}
                  onChange={(e) =>
                    updateCondition(condition.id, { value: e.target.value })
                  }
                  className="w-40"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 border-l pl-6">
        <Button variant="secondary" size="sm" onClick={addCondition}>
          <PlusIcon /> Add filter
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={conditions.length === 0}
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
}
