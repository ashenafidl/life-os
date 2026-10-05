import { icons } from "@phosphor-icons/core";
import { XIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { useMemo, useState } from "react";

import FormBase, { type FormControlProps } from "@/components/form/base";
import DynamicIcon from "@/components/shared/dynamic-icon";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useFieldContext } from "@/hooks/use-form";

interface Props extends FormControlProps {}

export default function FormIcon({ ...props }: Props) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const [search, setSearch] = useState("");

  const filteredIcons = useMemo(() => {
    const query = search.toLowerCase().trim();
    return icons.filter((icon) => {
      const matchesSearch =
        !query ||
        icon.name.toLowerCase().includes(query) ||
        icon.tags?.some((tag) => tag.toLowerCase().includes(query));

      return matchesSearch;
    });
  }, [search]);

  const handleSelect = (iconName: string) => {
    field.handleChange(iconName);
  };

  return (
    <FormBase {...props}>
      <div className="w-full space-y-3">
        <InputGroup>
          <InputGroupInput
            type="text"
            placeholder={`Search Phosphor Icons (v${process.env.NEXT_PUBLIC_PHOSPHOR_VERSION})`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton disabled={!search} onClick={() => setSearch("")}>
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>

        <div
          id={field.name}
          className="no-scrollbar grid max-h-32 grid-cols-8 justify-evenly gap-2 overflow-y-auto"
          aria-invalid={isInvalid}
        >
          {filteredIcons.map((icon) => (
            <div
              key={icon.name}
              className={cn(
                "hover:bg-accent flex aspect-square w-full items-center justify-center rounded-md border p-2",
                icon.pascal_name === field.state.value
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "",
              )}
              onClick={() => handleSelect(icon.pascal_name)}
            >
              <DynamicIcon name={icon.pascal_name} size={20} />
            </div>
          ))}

          {filteredIcons.length === 0 && (
            <p className="text-muted-foreground col-span-full py-6 text-center text-sm">
              No icons found for "{search}".
            </p>
          )}
        </div>
      </div>
    </FormBase>
  );
}
