"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { getProjectRole } from "@/app/firebase/util";
import { useFirebaseAuthBridge } from "@/app/components/providers/AuthProviders";
import type { ProjectRole } from "@/app/types/domain";

const RoleContext = createContext<ProjectRole | null>(null);

interface RoleResult {
  projectId: string;
  userId: string;
  role: ProjectRole | null;
}

export function RoleProvider({ projectId, children }: { projectId: string; children: ReactNode }) {
  const { data: session, status } = useSession();
  const { authReady } = useFirebaseAuthBridge();
  const userId = status === "authenticated" ? session?.user?.uid ?? null : null;
  const [result, setResult] = useState<RoleResult | null>(null);

  useEffect(() => {
    let active = true;
    if (!authReady || !userId || !projectId) return () => { active = false; };

    void getProjectRole({ projectId, userId })
      .then((role) => {
        if (active) setResult({ projectId, userId, role });
      })
      .catch((error: unknown) => {
        if (active) {
          console.error("Failed to load project role", error);
          setResult({ projectId, userId, role: null });
        }
      });

    return () => {
      active = false;
    };
  }, [authReady, projectId, userId]);

  const role = authReady && userId && result?.projectId === projectId && result.userId === userId
    ? result.role
    : null;

  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

export function useRole(): ProjectRole | null {
  return useContext(RoleContext);
}
