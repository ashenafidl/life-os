"use client";

import { revalidateLogic } from "@tanstack/react-form";
import { useEffect, useMemo, useState } from "react";

import {
  createProject,
  createTask,
  getProjects,
} from "@/actions/shiplog/actions";
import FormBase from "@/components/form/base";
import { useDialogClose } from "@/components/shared/app-dialog";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAppForm, useFieldContext } from "@/hooks/use-form";
import { taskInsertSchema } from "@/schemas/shiplog";

type Project = Awaited<ReturnType<typeof getProjects>>[number];

// Any "#word" in the task name is mention syntax, not literal content —
// strip it before persisting, regardless of whether it came from a
// selection or was just typed and left dangling.
function stripMentions(text: string): string {
  return text.replace(/#\S+/g, "").replace(/\s+/g, " ").trim();
}

function ProjectMentionInput({
  onProjectSelect,
}: {
  onProjectSelect: (projectId: string) => void;
}) {
  const field = useFieldContext<string>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getProjects().then((loadedProjects) => {
      if (!cancelled) setProjects(loadedProjects);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const mention = field.state.value.match(/#([^\s#]*)$/);
  const query = mention?.[1] ?? "";
  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.toLowerCase();

    return projects.filter((project) =>
      project.name.toLowerCase().includes(normalizedQuery),
    );
  }, [projects, query]);

  const selectProject = (project: Project) => {
    const mentionStart = mention?.index ?? field.state.value.length;
    const value = `${field.state.value.slice(0, mentionStart)}#${project.name} `;

    field.handleChange(value);
    onProjectSelect(project.id);
  };

  const handleCreateProject = async () => {
    const name = query.trim();
    if (!name) return;

    setIsCreating(true);
    try {
      const project = await createProject(name);
      setProjects((currentProjects) => [...currentProjects, project]);
      selectProject(project);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <FormBase label="Name">
      <div className="relative">
        <Input
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          aria-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
          placeholder="What needs to be done? Use # for a project"
          autoComplete="off"
        />

        {mention && (
          <div className="bg-popover text-popover-foreground absolute top-full z-10 mt-1 w-full rounded-md border p-1 shadow-md">
            {filteredProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                className="hover:bg-muted block w-full rounded-sm px-2 py-1.5 text-left text-sm"
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectProject(project);
                }}
              >
                #{project.name}
              </button>
            ))}

            {filteredProjects.length === 0 && query && (
              <button
                type="button"
                className="hover:bg-muted block w-full rounded-sm px-2 py-1.5 text-left text-sm"
                onMouseDown={(event) => {
                  event.preventDefault();
                  void handleCreateProject();
                }}
                disabled={isCreating}
              >
                {isCreating ? "Creating…" : `Create project "${query}"`}
              </button>
            )}

            {filteredProjects.length === 0 && !query && (
              <p className="text-muted-foreground px-2 py-1.5 text-sm">
                Type a project name after # to create one.
              </p>
            )}
          </div>
        )}
      </div>
    </FormBase>
  );
}

export default function TaskForm() {
  const close = useDialogClose();
  const [projectId, setProjectId] = useState<string | null>(null);

  const form = useAppForm({
    defaultValues: {
      name: "",
    },
    validators: {
      onDynamic: taskInsertSchema,
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      await createTask({
        ...value,
        name: stripMentions(value.name),
        projectId,
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(e);
      }}
    >
      <FieldGroup>
        <form.AppField
          name="name"
          children={() => (
            <ProjectMentionInput onProjectSelect={setProjectId} />
          )}
        />
      </FieldGroup>

      <form.AppForm>
        <div className="flex items-center gap-2">
          <form.ResetButton onClick={close} />
          <form.SubmitButton label="Add" />
        </div>
      </form.AppForm>
    </form>
  );
}
