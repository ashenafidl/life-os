import { ToggleGroupProps } from "@base-ui/react/toggle-group";
import { type ReactNode } from "react";

import FormBase, { type FormControlProps } from "@/components/form/base";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { useFieldContext } from "@/hooks/use-form";

interface Props
  extends FormControlProps, Omit<ToggleGroupProps<string>, "value"> {
  children: ReactNode;
  spacing?: number;
}

export default function FormToggleGroup({ children, ...props }: Props) {
  const field = useFieldContext<string | string[]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase {...props}>
      <ToggleGroup
        id={field.name}
        variant="outline"
        spacing={props.spacing}
        value={
          Array.isArray(field.state.value)
            ? field.state.value
            : field.state.value
              ? [field.state.value]
              : []
        }
        onValueChange={(values) => {
          const newValue = props.multiple ? values : (values[0] ?? "");
          field.handleChange(newValue);
        }}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
        {...props}
      >
        {children}
      </ToggleGroup>
    </FormBase>
  );
}
