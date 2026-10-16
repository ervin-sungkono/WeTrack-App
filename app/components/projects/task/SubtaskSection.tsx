"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import Table from "../../common/table/Table";
import { onSnapshot } from "firebase/firestore";
import CustomTooltip from "../../common/CustomTooltip";
import UserSelectButton from "../../common/UserSelectButton";
import SelectButton from "../../common/button/SelectButton";
import SimpleInputForm from "../../common/SimpleInputForm";
import PopUpLoad from "../../common/alert/PopUpLoad";
import Label from "../../common/Label";
import Link from "next/link";
import { FiPlus as PlusIcon } from "react-icons/fi";
import { FaTasks as TaskIcon } from "react-icons/fa";
import { getPriority } from "@/app/lib/string";
import { getSubtaskQueryReference } from "@/app/firebase/util";
import { createNewTask, updateTask, reorderTask } from "@/app/lib/fetch/task";
import { useSessionStorage } from "usehooks-ts";
import { useRole } from "@/app/lib/context/role";
import { validateUserRole } from "@/app/lib/helper";
import { useFirebaseAuthBridge } from "@/app/components/providers/AuthProviders";
import type { Project, TaskView, TeamMember, UserSummary } from "@/app/types/domain";
import type { SelectOption } from "../../types";

type ProjectSession = Pick<Project, "id" | "startStatus" | "endStatus">;
type SubtaskRow = Omit<TaskView, "status" | "assignedTo"> & {
  status?: string | null;
  assignedTo?: string | UserSummary | null;
  priority?: number | null;
};
type SubtaskSectionProps = {
  projectId: string;
  taskId: string;
  statusOptions: SelectOption<string>[];
  teamOptions: TeamMember[];
};

function asId(value: string | UserSummary | null | undefined): string | null {
  if (typeof value === "string") return value;
  return value?.id ?? null;
}

export default function SubtaskSection({ projectId, taskId, statusOptions, teamOptions }: SubtaskSectionProps) {
  const [subtaskData, setSubtaskData] = useState<SubtaskRow[]>([]);
  const [isCreatingSubtask, setCreatingSubtask] = useState(false);
  const [loading, setLoading] = useState(false);
  const [project] = useSessionStorage<ProjectSession | null>("project", null);
  const role = useRole();
  const { authReady } = useFirebaseAuthBridge();
  const canEdit = validateUserRole({ userRole: role, minimumRole: "Member" });
  const userOptions = useMemo(() => teamOptions.flatMap((member) => {
    const user = member.user;
    return user?.fullName ? [{ user: { id: user.id ?? member.userId, fullName: user.fullName, profileImage: user.profileImage } }] : [];
  }), [teamOptions]);

  useEffect(() => {
    if (!taskId || !projectId || !authReady) return;
    let active = true;
    const reference = getSubtaskQueryReference({ parentId: taskId, projectId, orderByKey: "createdAt" });
    const unsubscribe = onSnapshot(reference, (snapshot) => {
      if (!active) return;
      const subtasks = snapshot.docs.map((document): SubtaskRow => {
        const stored = document.data();
        const status = typeof stored.status === "string" ? stored.status : stored.statusId ?? null;
        return { ...stored, id: document.id, status } as SubtaskRow;
      });
      setSubtaskData(subtasks);
    }, (error) => console.error("Subtask listener failed", error));
    return () => { active = false; unsubscribe(); };
  }, [authReady, projectId, taskId]);

  const getPercentageCompletedSubTask = () => {
    const endStatus = project?.endStatus;
    if (!endStatus) return "0%";
    const completedTask = subtaskData.filter((subtask) => subtask.status === endStatus).length;
    const taskCount = Math.max(subtaskData.length, 1);
    return `${Math.round((completedTask / taskCount) * 100)}%`;
  };

  const handleAssigneeChange = useCallback(async (subtaskId: string, previousAssignee: string | null, value: { id?: string }) => {
    if (!canEdit || (value.id ?? null) === previousAssignee) return;
    setLoading(true);
    try {
      await updateTask({ taskId: subtaskId, assignedTo: value.id ?? null });
    } catch (error) {
      console.error("Failed to update subtask assignee", error);
    } finally {
      setLoading(false);
    }
  }, [canEdit]);

  const handleStatusChange = useCallback(async (subtask: SubtaskRow, newStatusId: string) => {
    if (!canEdit || !subtask.status || newStatusId === subtask.status) return;
    setLoading(true);
    try {
      await reorderTask({
        taskId: subtask.id,
        statusId: subtask.status,
        newStatusId,
        oldIndex: subtask.order ?? 0,
        newIndex: 0,
      });
    } catch (error) {
      console.error("Failed to update subtask status", error);
    } finally {
      setLoading(false);
    }
  }, [canEdit]);

  const columns = useMemo<ColumnDef<SubtaskRow, unknown>[]>(() => [
    { accessorKey: "id" },
    {
      accessorKey: "taskName",
      header: "Nama",
      cell: ({ row }) => <Link href={`/projects/${projectId}/tasks?taskId=${row.original.id}`} className="text-basic-blue hover:underline">{row.original.taskName}</Link>,
    },
    {
      accessorKey: "priority",
      header: "Prioritas",
      cell: ({ row }) => {
        const priority = getPriority(row.original.priority);
        return priority ? <Label text={priority.label.toUpperCase()} color={priority.color} /> : <span>-</span>;
      },
      size: 140,
    },
    {
      accessorKey: "assignedTo",
      header: "Penerima",
      cell: ({ row }) => {
        const assignedToId = asId(row.original.assignedTo);
        const defaultUser = userOptions.find((option) => option.user.id === assignedToId)?.user ?? null;
        return <UserSelectButton
          name={`assignee-${row.original.id}`}
          type="button"
          defaultValue={defaultUser}
          options={userOptions}
          disabled={!canEdit}
          onChange={(value) => void handleAssigneeChange(row.original.id, assignedToId, value)}
        />;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <SelectButton<string>
        name={`status-${row.original.id}`}
        defaultValue={statusOptions.find((status) => status.value === row.original.status)}
        options={statusOptions}
        onChange={(newStatusId) => void handleStatusChange(row.original, newStatusId)}
        disabled={!canEdit}
        buttonClass="border-none"
      />,
      size: 140,
    },
  ], [canEdit, handleAssigneeChange, handleStatusChange, projectId, statusOptions, userOptions]);

  const createSubtask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const rawName = formData.get("subTaskName");
    const taskName = typeof rawName === "string" ? rawName.trim() : "";
    const statusId = project?.startStatus;
    if (!canEdit || !taskName || !statusId) return;
    setLoading(true);
    try {
      const response = await createNewTask({ taskName, type: "SubTask", projectId, statusId, parentId: taskId });
      if (!response.success) return;
      setCreatingSubtask(false);
      form.reset();
    } catch (error) {
      console.error("Failed to create subtask", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 md:gap-2">
      {loading && <PopUpLoad />}
      <div className="relative flex items-center">
        <p className="font-semibold text-xs md:text-sm flex-grow">Subtugas <span>({subtaskData.length})</span></p>
        {canEdit && <div className="flex gap-1"><CustomTooltip id="subtask-tooltip" content="Tambah Subtugas">
          <button onClick={() => setCreatingSubtask(true)} className="p-2 hover:bg-gray-200 duration-200 transition-colors rounded"><PlusIcon size={16} /></button>
        </CustomTooltip></div>}
        {isCreatingSubtask && <div className="absolute top-0 left-0 translate-y-10 w-full z-50">
          <SimpleInputForm maxLength={50} name="subTaskName" onSubmit={createSubtask} onBlur={() => setCreatingSubtask(false)} placeholder="Masukkan nama subtugas..." />
        </div>}
      </div>
      {subtaskData.length > 0 ? <>
        <div className="w-full flex items-center gap-2">
          <div className="flex-grow h-2 bg-gray-200 rounded-full"><div className="bg-basic-blue h-full rounded-full" style={{ width: getPercentageCompletedSubTask() }} /></div>
          <p className="text-xs md:text-sm">{getPercentageCompletedSubTask()} Selesai</p>
        </div>
        <div className="max-h-[400px] overflow-y-auto"><Table data={subtaskData} columns={columns} usePagination={false} /></div>
      </> : <div className="flex flex-col items-center gap-2 py-8">
        <TaskIcon size={48} className="text-dark-blue/60" />
        <p className="text-xs md:text-sm text-dark-blue/80">Belum ada subtugas yang ditambahkan.</p>
      </div>}
    </div>
  );
}
