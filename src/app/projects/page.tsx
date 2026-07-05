import { FolderOpenIcon } from "@phosphor-icons/react/dist/ssr";

import ProjectForm from "@/components/projects/project-form";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { db } from "@/db/drizzle";
import { projects } from "@/db/schema";

export default async function ProjectsPage() {
  const allProjects = await db.select().from(projects);

  return (
    <div className="flex flex-col justify-center p-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex flex-col">
          <h1 className="font-heading text-2xl">Projects</h1>
          <p className="text-muted-foreground">Manage your projects</p>
        </div>

        <ProjectForm />
      </div>

      <div className="mx-auto py-12">
        {allProjects.length > 0 ? (
          allProjects.map((project) => (
            <div key={project.name}>
              {project.name} {project.color}
            </div>
          ))
        ) : (
          <div className="mx-auto">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderOpenIcon />
                </EmptyMedia>
                <EmptyTitle>No projects yet.</EmptyTitle>
                <EmptyDescription>
                  You haven't created any projects yet. Get started by creating
                  your first project.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <ProjectForm showLabel />
              </EmptyContent>
            </Empty>
          </div>
        )}
      </div>
    </div>
  );
}
