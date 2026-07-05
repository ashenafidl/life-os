import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { lazy } from "react";

const FormInput = lazy(() => import("@/components/form/form-input"));

const SubmitButton = lazy(() => import("@/components/form/submit-button"));
const ResetButton = lazy(() => import("@/components/form/reset-button"));

const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: { input: FormInput },
  formComponents: { SubmitButton, ResetButton },
  fieldContext,
  formContext,
});

export { useFieldContext, useFormContext, useAppForm };
