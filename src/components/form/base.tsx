import { ReactNode } from "react";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { useFieldContext } from "@/hooks/use-form";
import { isFieldRequired } from "@/lib/is-field-required";

export type FormControlProps = {
  label: string;
  description?: string;
};

type FormBaseProps = FormControlProps & {
  children: ReactNode;
  horizontal?: boolean;
  controlFirst?: boolean;
};

export default function FormBase({
  children,
  label,
  description,
  controlFirst,
  horizontal,
}: FormBaseProps) {
  const field = useFieldContext();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const isRequired = isFieldRequired(
    field.form.options.validators?.onDynamic,
    field.name,
  );

  const labelElement = (
    <>
      <FieldLabel htmlFor={field.name}>
        {label}
        {isRequired && <span className="text-destructive">*</span>}
      </FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
    </>
  );

  const errorElement = isInvalid && (
    <FieldError errors={field.state.meta.errors} />
  );

  return (
    <Field
      className="gap-2"
      data-invalid={isInvalid}
      orientation={horizontal ? "horizontal" : undefined}
    >
      {controlFirst ? (
        <>
          {children}
          <FieldContent>
            {labelElement}
            {errorElement}
          </FieldContent>
        </>
      ) : (
        <>
          <FieldContent>{labelElement}</FieldContent>
          {children}
          {errorElement}
        </>
      )}
    </Field>
  );
}
