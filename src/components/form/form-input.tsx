import type { InputHTMLAttributes } from "react";

import FormBase, { type FormControlProps } from "@/components/form/base";
import { Input } from "@/components/ui/input";
import { useFieldContext } from "@/hooks/use-form";

interface Props
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange">,
    FormControlProps {
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
}
export default function FormInput({ type = "text", ...props }: Props) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase {...props}>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
      />
    </FormBase>
  );
}
