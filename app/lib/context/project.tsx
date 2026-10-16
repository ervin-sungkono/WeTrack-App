"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { addTeam } from "@/app/lib/fetch/team";
import { createNewProject } from "@/app/lib/fetch/project";
import type { ApiEnvelope } from "@/app/lib/fetch/http";
import type { Project, ProjectDraft } from "@/app/types/domain";

interface ProjectContextValue {
  projectData: ProjectDraft;
  setProjectData(values: Partial<ProjectDraft>): void;
  resetProjectData(): void;
  submitProjectData(values?: Partial<ProjectDraft>): Promise<ApiEnvelope<Project>>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectData, setData] = useState<ProjectDraft>({});
  const setProjectData = useCallback((values: Partial<ProjectDraft>) => {
    setData((previous) => ({ ...previous, ...values }));
  }, []);
  const resetProjectData = useCallback(() => setData({}), []);

  const submitProjectData = useCallback(async (values: Partial<ProjectDraft> = {}) => {
    const payload = { ...projectData, ...values };
    if (!payload.projectName || !payload.key) {
      throw new Error("Project name and key are required");
    }

    const project = await createNewProject({ projectName: payload.projectName, key: payload.key });
    if (project.data && payload.teams) {
      try {
        const team = await addTeam({ teams: payload.teams, projectId: project.data.id });
        if (!team?.success) console.error("Failed to invite project team members");
      } catch (error) {
        console.error("Failed to invite project team members", error);
      }
    }

    resetProjectData();
    return project;
  }, [projectData, resetProjectData]);

  const value = useMemo(() => ({ projectData, setProjectData, resetProjectData, submitProjectData }), [
    projectData,
    setProjectData,
    resetProjectData,
    submitProjectData,
  ]);

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjectData(): ProjectContextValue {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("Project hooks must be used inside ProjectProvider");
  return context;
}
