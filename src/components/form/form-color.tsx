import { type InputHTMLAttributes } from "react";

import FormBase, { type FormControlProps } from "@/components/form/base";
import { useFieldContext } from "@/hooks/use-form";

interface Props
  extends
    FormControlProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {}

export default function FormColor({ ...props }: Props) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase {...props}>
      <div className="flex items-center gap-2">
        <input
          id={field.name}
          type="color"
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          aria-invalid={isInvalid}
          className="size-10 cursor-pointer rounded-md border bg-transparent p-1"
          {...props}
        />
        <span className="text-muted-foreground text-sm uppercase">
          {field.state.value}
        </span>
      </div>
    </FormBase>
  );
}
