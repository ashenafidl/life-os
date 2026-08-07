"use client";

import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { modules, navItems } from "@/constants/module";
import { useModule } from "@/hooks/use-module";

export default function Home() {
  const router = useRouter();
  const { setActiveModule } = useModule();

  const goToModule = (moduleKey: string) => {
    const module = modules.find((m) => m.key === moduleKey);
    const firstItem = navItems[moduleKey][0];
    if (module) setActiveModule(module);
    if (firstItem) router.push(firstItem.href!);
  };

  return (
    <div className="flex min-h-screen items-center justify-center gap-4 p-6">
      {modules.map((module) => (
        <Card
          key={module.key}
          onClick={() => goToModule(module.key)}
          className="hover:border-primary hover:bg-accent hover:border-0.5 min-w-48 cursor-pointer border transition-all hover:-translate-y-1"
        >
          <CardContent className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-lg transition-transform group-hover:scale-105">
              <module.icon className="size-6" />
            </div>
            <div>
              <p className="font-medium">{module.name}</p>
              {module.description && (
                <p className="text-muted-foreground mt-1 text-xs">
                  {module.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
