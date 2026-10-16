"use client";

import SearchBar from "../../common/SearchBar";
import { useEffect, useMemo, useState } from "react";
import SelectButton from "../../common/button/SelectButton";
import { IoFilter as FilterIcon } from "react-icons/io5";
import { useRole } from "@/app/lib/context/role";
import { getDocumentReference, getProjectTeamQueryReference, getQueryReference, getQueryReferenceOrderBy } from "@/app/firebase/util";
import { getDoc, onSnapshot } from "firebase/firestore";
import Calendar from "../../common/calendar/Calendar";
import { validateUserRole, timestampToMilliseconds } from "@/app/lib/helper";
import Button from "../../common/button/Button";
import { FaFilterCircleXmark as CloseFilterIcon } from "react-icons/fa6";
import { useFirebaseAuthBridge } from "@/app/components/providers/AuthProviders";
import type { Task, TaskStatus, TaskView, TeamMember, UserSummary } from "@/app/types/domain";
import type { SelectOption } from "../../types";

type TimelineTask = TaskView & {
  assignedToData?: UserSummary | null;
  statusData?: TaskStatus | null;
  labelsData?: string | null;
  parentTaskData?: Pick<Task, "id" | "taskName"> | null;
};

type TimelineCalendarTask = Pick<Task, "id" | "projectId" | "taskName" | "type" | "startDate" | "dueDate" | "finishedDate"> & {
  displayId: number;
};

interface TimelineContentProps {
  projectId: string;
}

const emptyOption = (label: string): SelectOption<string | null> => ({ label, value: null });

export default function TimelineContent({ projectId }: TimelineContentProps) {
  const role = useRole();
  const { authReady } = useFirebaseAuthBridge();
  const [query, setQuery] = useState("");
  const [labelsState, setLabelsState] = useState<{ projectId: string; options: SelectOption<string | null>[] } | null>(null);
  const [assigneesState, setAssigneesState] = useState<{ projectId: string; options: SelectOption<string | null>[] } | null>(null);
  const [statusesState, setStatusesState] = useState<{ projectId: string; options: SelectOption<string | null>[] } | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [assignee, setAssignee] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [filterDropdown, setFilterDropdown] = useState(false);
  const [projectState, setProjectState] = useState<{ projectId: string; key: string | null } | null>(null);
  const [taskData, setTaskData] = useState<TimelineTask[]>([]);
  const [taskDataProjectId, setTaskDataProjectId] = useState<string | null>(null);
  const labelsData = authReady && labelsState?.projectId === projectId ? labelsState.options : [];
  const assigneesData = authReady && assigneesState?.projectId === projectId ? assigneesState.options : [];
  const statusData = authReady && statusesState?.projectId === projectId ? statusesState.options : [];
  const projectKey = authReady && projectState?.projectId === projectId ? projectState.key : null;

  useEffect(() => {
    if (!projectId || !authReady) return;
    let active = true;
    const reference = getDocumentReference({ collectionName: "projects", id: projectId });
    const unsubscribe = onSnapshot(reference, (snapshot) => {
      if (!active) return;
      const key = snapshot.data()?.key;
      setProjectState({ projectId, key: typeof key === "string" ? key : null });
    }, (error) => console.error("Timeline project listener failed", error));
    return () => { active = false; unsubscribe(); };
  }, [authReady, projectId]);

  useEffect(() => {
    if (!projectId || !authReady) return;
    let active = true;

    const labelsReference = getQueryReference({ collectionName: "labels", field: "projectId", id: projectId });
    const unsubscribeLabels = onSnapshot(labelsReference, (snapshot) => {
      if (active) setLabelsState({ projectId, options: snapshot.docs.map((document) => ({ label: document.data().content, value: document.data().content })) });
    }, (error) => console.error("Timeline label listener failed", error));

    const teamReference = getProjectTeamQueryReference({ projectId });
    const unsubscribeTeam = onSnapshot(teamReference, async (snapshot) => {
      try {
        const options = await Promise.all(snapshot.docs.map(async (document): Promise<SelectOption<string | null> | null> => {
          const member: TeamMember = { id: document.id, ...document.data() };
          const userSnapshot = await getDoc(getDocumentReference({ collectionName: "users", id: member.userId }));
          const fullName = userSnapshot.data()?.fullName;
          return typeof fullName === "string" ? { label: fullName, value: fullName } : null;
        }));
        if (active) setAssigneesState({ projectId, options: options.filter((option): option is SelectOption<string | null> => option !== null) });
      } catch (error) {
        console.error("Failed to load timeline assignees", error);
      }
    }, (error) => console.error("Timeline team listener failed", error));

    const statusesReference = getQueryReferenceOrderBy({ collectionName: "taskStatuses", field: "projectId", id: projectId, orderByKey: "order" });
    const unsubscribeStatuses = onSnapshot(statusesReference, (snapshot) => {
      if (!active) return;
      setStatusesState({ projectId, options: snapshot.docs.flatMap((document) => {
        const statusName = document.data().statusName ?? document.data().status;
        return statusName ? [{ label: statusName, value: statusName }] : [];
      }) });
    }, (error) => console.error("Timeline status listener failed", error));

    return () => {
      active = false;
      unsubscribeLabels();
      unsubscribeTeam();
      unsubscribeStatuses();
    };
  }, [authReady, projectId]);

  useEffect(() => {
    if (!projectId || !authReady) return;
    let active = true;
    const reference = getQueryReferenceOrderBy({ collectionName: "tasks", field: "projectId", id: projectId, orderByKey: "order" });
    const unsubscribe = onSnapshot(reference, async (snapshot) => {
      try {
        const tasks = await Promise.all(snapshot.docs.map(async (document): Promise<TimelineTask> => {
          const stored = document.data();
          const task: TimelineTask = { ...stored, id: document.id, assignedToData: null, statusData: null, labelsData: null, parentTaskData: null };
          if (task.deletedAt) return task;

          const assignedToId = typeof task.assignedTo === "string" ? task.assignedTo : task.assignedTo?.id;
          if (assignedToId) {
            const userSnapshot = await getDoc(getDocumentReference({ collectionName: "users", id: assignedToId }));
            if (userSnapshot.exists()) {
              const profile = userSnapshot.data();
              task.assignedToData = { id: userSnapshot.id, fullName: profile.fullName, profileImage: profile.profileImage };
            }
          }

          const statusId = typeof task.status === "string" ? task.status : task.status?.id ?? task.statusId;
          if (statusId) {
            const statusSnapshot = await getDoc(getDocumentReference({ collectionName: "taskStatuses", id: statusId }));
            if (statusSnapshot.exists()) task.statusData = { id: statusSnapshot.id, ...statusSnapshot.data() };
          }

          const labelIds = (task.labels ?? []).flatMap((item) => typeof item === "string" ? [item] : [item.id]);
          if (labelIds.length) {
            const labels = await Promise.all(labelIds.map(async (id) => {
              const labelSnapshot = await getDoc(getDocumentReference({ collectionName: "labels", id }));
              return labelSnapshot.exists() ? labelSnapshot.data().content : null;
            }));
            task.labelsData = labels.filter((content): content is string => Boolean(content)).join(", ");
          }

          if (task.parentId) {
            const parentSnapshot = await getDoc(getDocumentReference({ collectionName: "tasks", id: task.parentId }));
            if (parentSnapshot.exists()) task.parentTaskData = { id: parentSnapshot.id, taskName: parentSnapshot.data().taskName };
          }
          return task;
        }));
        if (active) {
          setTaskData(tasks.filter((task) => !task.deletedAt));
          setTaskDataProjectId(projectId);
        }
      } catch (error) {
        console.error("Failed to load timeline tasks", error);
      }
    }, (error) => console.error("Timeline task listener failed", error));
    return () => { active = false; unsubscribe(); };
  }, [authReady, projectId]);

  const tasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (authReady && taskDataProjectId === projectId ? taskData : [])
      .filter((task) => task.startDate != null && task.dueDate != null && task.taskName.toLowerCase().includes(normalizedQuery))
      .filter((task) => assignee == null || task.assignedToData?.fullName === assignee)
      .filter((task) => status == null || (task.statusData?.statusName ?? task.statusData?.status) === status)
      .filter((task) => label == null || task.labelsData?.includes(label))
      .sort((left, right) => (timestampToMilliseconds(right.createdAt ?? null) ?? 0) - (timestampToMilliseconds(left.createdAt ?? null) ?? 0))
      .map((task): TimelineCalendarTask => ({
        id: task.id,
        projectId: task.projectId,
        taskName: task.taskName,
        type: task.type,
        displayId: task.displayId ?? 0,
        startDate: task.startDate,
        dueDate: task.dueDate,
        finishedDate: task.finishedDate,
      }));
  }, [assignee, authReady, label, projectId, query, status, taskData, taskDataProjectId]);

  const resetFilter = () => {
    setAssignee(null);
    setStatus(null);
    setLabel(null);
  };

  return <div className="h-full overflow-y-auto flex flex-col gap-4">
    <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
      <div className="w-full flex justify-center md:justify-start items-center gap-3 md:gap-6 z-almostFixed">
        <SearchBar placeholder="Cari jadwal..." handleSearch={(value) => setQuery(value.toLowerCase())} />
        <div className="relative">
          <button className="block md:hidden text-white bg-basic-blue hover:bg-basic-blue/80 rounded-md p-1.5" onClick={() => setFilterDropdown(!filterDropdown)}><FilterIcon size={20} /></button>
          <div className={`${filterDropdown ? "block" : "hidden"} border border-dark-blue/30 md:border-none md:flex z-fixed absolute -bottom-2 right-0 translate-y-full md:translate-y-0 px-2 py-3 bg-white rounded-md md:bg-transparent md:p-0 md:static flex flex-col md:flex-row gap-2 md:gap-4`}>
            <SelectButton<string | null> name="assignee-button" options={[emptyOption("Penerima"), ...assigneesData]} onChange={setAssignee} reset={!assignee} />
            <SelectButton<string | null> name="status-button" options={[emptyOption("Status"), ...statusData]} onChange={setStatus} reset={!status} />
            <SelectButton<string | null> name="label-button" options={[emptyOption("Label"), ...labelsData]} onChange={setLabel} reset={!label} />
            {(assignee || status || label) && <Button variant="primary" size="sm" onClick={resetFilter}><div className="flex items-center gap-2"><CloseFilterIcon size={16} /><p>Hapus Filter</p></div></Button>}
          </div>
        </div>
      </div>
    </div>
    <div className="w-full h-full flex-grow overflow-auto flex justify-start items-center">
      <div className="min-w-[900px] max-w-[1200px] h-full px-2.5 pt-2 pb-4">
        <Calendar projectKey={projectKey ?? ""} projectId={projectId} tasks={tasks} isEditable={validateUserRole({ userRole: role, minimumRole: "Member" })} />
      </div>
    </div>
  </div>;
}
