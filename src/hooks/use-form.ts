import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { lazy } from "react";

const FormInput = lazy(() => import("@/components/form/form-input"));
const FormTextarea = lazy(() => import("@/components/form/form-textarea"));
const FormDate = lazy(() => import("@/components/form/form-date"));
const FormIcon = lazy(() => import("@/components/form/form-icon"));
const FormColor = lazy(() => import("@/components/form/form-color"));
const FormToggleGroup = lazy(
  () => import("@/components/form/form-toggle-group"),
);

const SubmitButton = lazy(() => import("@/components/form/submit-button"));
const ResetButton = lazy(() => import("@/components/form/reset-button"));

const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: {
    input: FormInput,
    textarea: FormTextarea,
    date: FormDate,
    toggleGroup: FormToggleGroup,
    icon: FormIcon,
    color: FormColor,
  },
  formComponents: { SubmitButton, ResetButton },
  fieldContext,
  formContext,
});

export { useFieldContext, useFormContext, useAppForm };
