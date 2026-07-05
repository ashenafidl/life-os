"use client";

import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { revalidateLogic } from "@tanstack/react-form";
import z from "zod";

import { createProject } from "@/actions/actions";
import AppDialog, { useDialogClose } from "@/components/shared/app-dialog";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { useAppForm } from "@/hooks/use-form";

interface Props {
  showLabel?: boolean;
}

export default function ProjectForm({ showLabel = false }: Props) {
  return (
    <AppDialog
      trigger={
        <Button>
          <PlusIcon />
          {showLabel && "Create project"}
        </Button>
      }
      title="Create Project"
      description="Fill out the form to create a new project"
    >
      <ProjectFormBody />
    </AppDialog>
  );
}

function ProjectFormBody() {
  const close = useDialogClose();

  const projectSchema = z.object({
    name: z.string().nonempty(),
    color: z.string(),
  });

  const form = useAppForm({
    defaultValues: { name: "", color: "" },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: projectSchema,
    },
    onSubmit: async ({ value }) => {
      await createProject(value);
      close();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.AppField
          name="name"
          children={(field) => <field.input label="Name" />}
        />
        <form.AppField
          name="color"
          children={(field) => <field.input label="Color" />}
        />
        <form.AppForm>
          <div className="flex items-center gap-2">
            <form.ResetButton onClick={close} />
            <form.SubmitButton />
          </div>
        </form.AppForm>
      </FieldGroup>
    </form>
  );
}
