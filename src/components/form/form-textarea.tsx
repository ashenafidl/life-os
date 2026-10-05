import type { TextareaHTMLAttributes } from "react";

import FormBase, { type FormControlProps } from "@/components/form/base";
import { Textarea } from "@/components/ui/textarea";
import { useFieldContext } from "@/hooks/use-form";

interface Props
  extends
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange">,
    FormControlProps {}

export default function FormTextarea({ ...props }: Props) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase {...props}>
      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        {...props}
      />
    </FormBase>
  );
}
