"use client";

import { useEffect, useMemo, useState } from "react";
import { getDoc, onSnapshot } from "firebase/firestore";
import type { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaCommentDots as CommentIcon, FaTasks as TaskListIcon } from "react-icons/fa";
import { MdTask as TaskIcon } from "react-icons/md";
import AssignedTaskItem from "./AssignedTaskItem";
import OverviewCard from "./OverviewCard";
import { getDocumentReference, getQueryReference, getTaskReferenceOrderBy } from "@/app/firebase/util";
import Table from "../../common/table/Table";
import LinkButton from "../../common/button/LinkButton";
import { getPriority, extractUniqueMentionTags } from "@/app/lib/string";
import Label from "../../common/Label";
import { dateFormat } from "@/app/lib/date";
import AssignedCommentItem from "./AssignedCommentItem";
import { useRole } from "@/app/lib/context/role";
import { validateUserRole, timestampToMilliseconds } from "@/app/lib/helper";
import UserSelectButton from "../../common/UserSelectButton";
import SelectButton from "../../common/button/SelectButton";
import { getAllTeamMember } from "@/app/lib/fetch/team";
import { getAllTaskStatus } from "@/app/lib/fetch/taskStatus";
import { reorderTask, updateTask } from "@/app/lib/fetch/task";
import PopUpLoad from "../../common/alert/PopUpLoad";
import type {
  Comment,
  Project,
  PublicUserProfile,
  Task,
  TaskStatus,
  TaskView,
  TeamMember,
  UserSummary,
} from "@/app/types/domain";
import type { SelectOption } from "@/app/types/ui";

type OverviewTask = TaskView & {
  assignedToData?: (UserSummary & { fullName: string }) | null;
  statusData?: TaskStatus | null;
};

type OverviewComment = Omit<Comment, "task" | "user"> & {
  task?: (Pick<Task, "id" | "taskName"> & { displayId?: number }) | null;
  user?: PublicUserProfile | null;
};

type AssigneeOption = { user: UserSummary & { fullName: string } };
type OverviewContentProps = { projectId: string };

const fallbackPriority = { label: "Tidak ada", value: 0, color: "#A9A9A9" };

function statusIdOf(task: OverviewTask): string | null {
  if (typeof task.status === "string") return task.status;
  return task.status?.id ?? null;
}

function assigneeIdOf(task: OverviewTask): string | null {
  if (typeof task.assignedTo === "string") return task.assignedTo;
  return task.assignedTo?.id ?? null;
}

function taskOrder(task: Pick<TaskView, "order">): number {
  return typeof task.order === "number" && Number.isInteger(task.order) && task.order >= 0 ? task.order : -1;
}

export default function OverviewContent({ projectId }: OverviewContentProps) {
  const { data: session } = useSession();
  const userId = session?.user?.uid ?? null;
  const role = useRole();
  const [projectKey, setProjectKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState<OverviewTask[]>([]);
  const [assignedTaskData, setAssignedTaskData] = useState<OverviewTask[]>([]);
  const [assignedCommentData, setAssignedCommentData] = useState<OverviewComment[]>([]);
  const [assigneesData, setAssigneesData] = useState<AssigneeOption[]>([]);
  const [statusData, setStatusData] = useState<TaskStatus[]>([]);

  useEffect(() => {
    if (!projectId) return;
    const reference = getDocumentReference({ collectionName: "projects", id: projectId });
    return onSnapshot(reference, (snapshot) => {
      if (!snapshot.exists()) {
        setProjectKey(null);
        return;
      }
      const project: Project = { id: snapshot.id, ...snapshot.data() };
      setProjectKey(project.key || null);
    }, (error) => {
      console.error("Failed to subscribe to project details", error);
      setProjectKey(null);
    });
  }, [projectId]);

  useEffect(() => {
    if (!projectId || !userId) return;

    let active = true;
    const taskReference = getTaskReferenceOrderBy({
      field: "projectId",
      id: projectId,
      orderByKey: "order",
    });
    const taskUnsubscribe = onSnapshot(taskReference, async (snapshot) => {
      const tasks = await Promise.all(snapshot.docs.map(async (document): Promise<OverviewTask> => {
        const task: Task = { id: document.id, ...document.data() };
        const statusId = task.status ?? null;
        const currentStatus = statusData.find((status) => status.id === statusId) ?? null;
        let assignedToData: OverviewTask["assignedToData"] = null;

        if (task.assignedTo) {
          try {
            const profileReference = getDocumentReference({ collectionName: "users", id: task.assignedTo });
            const profileSnapshot = await getDoc(profileReference);
            if (profileSnapshot.exists()) {
              const profile = profileSnapshot.data();
              assignedToData = {
                id: task.assignedTo,
                fullName: profile.fullName || "Anggota",
                profileImage: profile.profileImage ?? null,
              };
            }
          } catch (error) {
            console.error("Failed to load task assignee profile", error);
          }
        }

        return { ...task, assignedToData, statusData: currentStatus };
      }));
      tasks.sort((left, right) => (timestampToMilliseconds(right.createdAt ?? null) ?? 0) - (timestampToMilliseconds(left.createdAt ?? null) ?? 0));
      if (!active) return;
      setTaskData(tasks.slice(0, 5));
      setAssignedTaskData(tasks.filter((task) => assigneeIdOf(task) === userId).slice(0, 5));
    }, (error) => {
      console.error("Failed to subscribe to project tasks", error);
      if (active) {
        setTaskData([]);
        setAssignedTaskData([]);
      }
    });

    const commentReference = getQueryReference({ collectionName: "comments", field: "projectId", id: projectId });
    const commentUnsubscribe = onSnapshot(commentReference, async (snapshot) => {
      const comments = await Promise.all(snapshot.docs.map(async (document): Promise<OverviewComment | null> => {
        const comment: Comment = { id: document.id, ...document.data() };
        let task: OverviewComment["task"] = null;
        let user: PublicUserProfile | null = null;

        try {
          const [taskSnapshot, userSnapshot] = await Promise.all([
            getDoc(getDocumentReference({ collectionName: "tasks", id: comment.taskId })),
            getDoc(getDocumentReference({ collectionName: "users", id: comment.userId })),
          ]);
          if (taskSnapshot.exists()) {
            const taskData = taskSnapshot.data();
            if (taskData.projectId === projectId) {
              task = { id: taskSnapshot.id, taskName: taskData.taskName, displayId: taskData.displayId };
            }
          }
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            user = {
              id: comment.userId,
              fullName: userData.fullName || "Anggota",
              profileImage: userData.profileImage ?? null,
            };
          }
        } catch (error) {
          console.error("Failed to load overview comment details", error);
        }

        // A comment with a cross-project or deleted task should not appear in
        // this project's overview, even if an old document has stale links.
        if (!task) return null;
        return {
          ...comment,
          task,
          user: user ?? { id: comment.userId, fullName: "Anggota", profileImage: null },
        };
      }));
      const visible = comments.filter((comment): comment is OverviewComment => comment !== null);
      visible.sort((left, right) => (timestampToMilliseconds(right.createdAt ?? null) ?? 0) - (timestampToMilliseconds(left.createdAt ?? null) ?? 0));
      if (!active) return;
      setAssignedCommentData(visible.filter((comment) =>
        extractUniqueMentionTags(comment.commentText).some((mention) => mention.id === userId),
      ).slice(0, 5));
    }, (error) => {
      console.error("Failed to subscribe to project comments", error);
      if (active) setAssignedCommentData([]);
    });

    return () => {
      active = false;
      taskUnsubscribe();
      commentUnsubscribe();
    };
  }, [projectId, userId, statusData]);

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    void Promise.all([getAllTeamMember({ projectId, excludeViewer: true }), getAllTaskStatus(projectId)])
      .then(([membersResponse, statusesResponse]) => {
        if (!active) return;
        const members = membersResponse.data ?? [];
        setAssigneesData(members
          .filter((member): member is TeamMember & { user: UserSummary & { fullName: string } } =>
            member.status === "accepted" && member.role !== "Viewer" && Boolean(member.user?.id && member.user.fullName),
          )
          .map((member) => ({ user: member.user })));
        setStatusData(statusesResponse.data ?? []);
      })
      .catch((error: unknown) => {
        console.error("Failed to load overview options", error);
        if (active) {
          setAssigneesData([]);
          setStatusData([]);
        }
      });
    return () => { active = false; };
  }, [projectId]);

  const statusOptions = useMemo<SelectOption<string>[]>(() => statusData.map((status) => ({
    label: status.statusName ?? status.status ?? "Status",
    value: status.id,
  })), [statusData]);

  const handleAssigneeChange = async (taskId: string, currentId: string | null, value: { id?: string }) => {
    setLoading(true);
    try {
      const nextId = value.id || null;
      if (nextId !== currentId) await updateTask({ taskId, assignedTo: nextId });
    } catch (error) {
      console.error("Failed to update task assignee", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, statusId: string | null, newStatusId: string) => {
    const task = taskData.find((item) => item.id === taskId);
    if (!task || !statusId || newStatusId === statusId) return;
    const oldIndex = taskOrder(task);
    if (oldIndex < 0) {
      console.error("Cannot transition a task without a valid order index");
      return;
    }
    setLoading(true);
    try {
      await reorderTask({ taskId, statusId, newStatusId, oldIndex, newIndex: 0 });
    } catch (error) {
      console.error("Failed to update task status", error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<OverviewTask, unknown>[] = [
    { accessorKey: "id" },
    { accessorKey: "order" },
    {
      accessorKey: "taskName",
      header: "Nama Tugas",
      cell: ({ row }) => (
        <Link className="w-full h-full block text-basic-blue hover:text-basic-blue/75" href={`/projects/${projectId}/tasks?taskId=${row.original.id}`}>
          {row.original.taskName}
        </Link>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Tenggat Waktu",
      cell: ({ row }) => <div className="w-full h-full block">{dateFormat(row.original.dueDate ?? null) || "Belum Ditetapkan"}</div>,
    },
    {
      accessorKey: "priority",
      header: "Prioritas",
      cell: ({ row }) => {
        const priority = getPriority(row.original.priority) ?? fallbackPriority;
        return <div className="w-full h-full flex justify-start"><Label text={priority.label.toUpperCase()} color={priority.color} /></div>;
      },
    },
    {
      accessorKey: "assignedToData",
      header: "Penerima",
      cell: ({ row }) => {
        const currentAssigneeId = assigneeIdOf(row.original);
        return (
          <div className="w-full h-full block">
            <UserSelectButton
              name={`assignee-${row.original.id}`}
              type="button"
              defaultValue={row.original.assignedToData ?? null}
              options={assigneesData}
              disabled={!validateUserRole({ userRole: role, minimumRole: "Member" })}
              onChange={(value) => handleAssigneeChange(row.original.id, currentAssigneeId, value)}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const currentStatusId = statusIdOf(row.original);
        const defaultValue = statusOptions.find((option) => option.value === currentStatusId);
        return (
          <div className="w-full h-full block">
            <SelectButton
              name={`status-${row.original.id}`}
              defaultValue={defaultValue}
              options={statusOptions}
              disabled={!validateUserRole({ userRole: role, minimumRole: "Member" })}
              onChange={(newStatusId) => currentStatusId && handleStatusChange(row.original.id, currentStatusId, newStatusId)}
              buttonClass="border-none"
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4 pr-4">
      {loading && <PopUpLoad />}
      {taskData.length === 0 ? (
        <OverviewCard title="Tugas Terbaru">
          <div className={`${validateUserRole({ userRole: role, minimumRole: "Member" }) ? "max-h-[350px] h-[25vh]" : "h-[60vh]"} overflow-hidden flex flex-col justify-center items-center`}>
            <div className="flex flex-col justify-center items-center">
              <div className="flex flex-col justify-center items-center gap-2">
                <TaskListIcon size={48} className="text-dark-blue/60" />
                <p className="text-xs md:text-sm text-dark-blue/80 text-center">Belum ada data tugas yang tersedia.</p>
              </div>
              {validateUserRole({ userRole: role, minimumRole: "Member" }) && (
                <LinkButton href={`/projects/${projectId}/board`} variant="primary" size="md" className="mt-1 md:mt-2 py-1 xl:py-2">
                  Buat Tugas Baru Sekarang
                </LinkButton>
              )}
            </div>
          </div>
        </OverviewCard>
      ) : (
        <OverviewCard title="Tugas Terbaru" action="Lihat semua" href={`/projects/${projectId}/tasks`}>
          <div className={`${validateUserRole({ userRole: role, minimumRole: "Member" }) ? "max-h-[350px] h-[25vh]" : "h-[60vh]"}`}>
            <Table<OverviewTask> data={taskData} columns={columns} usePagination={false} fullWidth={false} sortable={false} />
          </div>
        </OverviewCard>
      )}
      {validateUserRole({ userRole: role, minimumRole: "Member" }) && (
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <OverviewCard title="Ditugaskan Kepada Saya">
            <div className="flex flex-col gap-2 max-h-[200px] md:h-[175px] overflow-x-hidden overflow-y-auto">
              {assignedTaskData.length > 0 ? assignedTaskData.map((task) => (
                <AssignedTaskItem
                  key={task.id}
                  title={task.taskName}
                  type={task.type}
                  startDate={task.startDate}
                  endDate={task.dueDate}
                  finishedDate={task.finishedDate}
                  status={task.statusData ?? null}
                  priority={task.priority}
                  projectKey={projectKey}
                  displayId={task.displayId}
                  href={`/projects/${projectId}/tasks?taskId=${task.id}`}
                />
              )) : (
                <div className="flex flex-col justify-center items-center gap-2 mt-4 md:mt-8">
                  <TaskIcon size={48} className="text-dark-blue/60" />
                  <p className="text-xs md:text-sm text-dark-blue/80 text-center">Belum ada tugas yang ditugaskan kepada Anda.</p>
                </div>
              )}
            </div>
          </OverviewCard>
          <OverviewCard title="Komentar Terbaru">
            <div className="flex flex-col gap-2 max-h-[200px] md:h-[175px] overflow-x-hidden overflow-y-auto">
              {assignedCommentData.length > 0 ? assignedCommentData.map((comment) => (
                <AssignedCommentItem
                  key={comment.id}
                  text={comment.commentText}
                  user={comment.user ?? { id: comment.userId, fullName: "Anggota", profileImage: null }}
                  createdAt={comment.createdAt}
                  projectKey={projectKey}
                  displayId={comment.task?.displayId}
                  href={`/projects/${projectId}/tasks?taskId=${comment.taskId}`}
                />
              )) : (
                <div className="flex flex-col justify-center items-center gap-2 mt-4 md:mt-8">
                  <CommentIcon size={48} className="text-dark-blue/60" />
                  <p className="text-xs md:text-sm text-dark-blue/80 text-center">Belum ada komentar yang menyebut Anda.</p>
                </div>
              )}
            </div>
          </OverviewCard>
        </div>
      )}
    </div>
  );
}
