import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { lazy } from "react";

const FormInput = lazy(() => import("@/components/form/form-input"));
const FormDate = lazy(() => import("@/components/form/form-date"));

const SubmitButton = lazy(() => import("@/components/form/submit-button"));
const ResetButton = lazy(() => import("@/components/form/reset-button"));

const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldComponents: { input: FormInput, date: FormDate },
  formComponents: { SubmitButton, ResetButton },
  fieldContext,
  formContext,
});

export { useFieldContext, useFormContext, useAppForm };
