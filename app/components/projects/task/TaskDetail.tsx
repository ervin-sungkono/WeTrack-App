"use client"
import { useEffect, useState, memo, type ChangeEvent, type FormEvent } from "react"
import dynamic from "next/dynamic"
import Label from "../../common/Label"
import UserSelectButton from "../../common/UserSelectButton"
import DotButton from "../../common/button/DotButton"
import ActivitySection from "./ActivitySection"
import { TailSpin } from "react-loader-spinner"
import ChatSection from "./ChatSection"
import PopUpLoad from "../../common/alert/PopUpLoad"
import UpdateTaskNameForm from "../../common/form/UpdateTaskNameForm"
import PopUpForm from "../../common/alert/PopUpForm"
import Button from "../../common/button/Button"

import { useSessionStorage } from "usehooks-ts"
import { getDocumentReference } from "@/app/firebase/util"
import { onSnapshot, getDoc } from "firebase/firestore"
import { priorityList } from "@/app/lib/string"
import { dateFormat } from "@/app/lib/date"
import { pickTextColorBasedOnBgColor } from "@/app/lib/color"

import { IoIosCloseCircle as CloseIcon } from "react-icons/io";
import { getAllTeamMember } from "@/app/lib/fetch/team"
import { updateTask, deleteTask, reorderTask, getAllTask } from "@/app/lib/fetch/task"
import { useRole } from "@/app/lib/context/role"
import { validateUserRole } from "@/app/lib/helper"
import SelectButton from "../../common/button/SelectButton"
import { getAllTaskStatus } from "@/app/lib/fetch/taskStatus"
import SimpleTextareaForm from "../../common/SimpleTextareaForm"
import SimpleDateForm from "../../common/SimpleDateForm"
import ParentSelectButton from "../../common/ParentSelectButton"
import LabelInput from "./LabelInput"
import EmptyState from "../../common/EmptyState"
import { useFirebaseAuthBridge } from "@/app/components/providers/AuthProviders"
import type { Label as LabelRecord, Project, TaskView, TeamMember, UserSummary } from "@/app/types/domain"
import type { SelectOption } from "../../types"

const AttachmentSection = dynamic(() => import("./AttachmentSection"))
const SubtaskSection = dynamic(() => import("./SubtaskSection"))

type ProjectSession = Pick<Project, "id" | "key" | "startStatus" | "endStatus">
type TaskDetailTask = Omit<TaskView, "labels" | "assignedTo"> & {
    displayId?: number
    labels?: LabelRecord[]
    assignedTo?: UserSummary | null
    parent?: { id: string; taskName?: string } | null
}

interface TaskDetailProps {
    taskId?: string | null
    projectId?: string
    closeFn?: () => void
}

function toDateInput(value: TaskDetailTask["startDate"]): string {
    if (value == null) return ""
    const date = value instanceof Date
        ? value
        : typeof value === "number" || typeof value === "string"
            ? new Date(value)
            : "toDate" in value && typeof value.toDate === "function"
                ? value.toDate()
                : "seconds" in value
                    ? new Date(value.seconds * 1000)
                    : null
    return date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : ""
}

function TaskDetail({ taskId, projectId, closeFn }: TaskDetailProps){
    const [task, setTask] = useState<TaskDetailTask | null>(null)
    const [taskNotFound, setTaskNotFound] = useState(false)
    const [updateLoading, setUpdateLoading] = useState(false)
    const [updateConfirmation, setUpdateConfirmation] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState(false)
    const [editDescription, setEditDescription] = useState(false)
    const [editLabels, setEditLabels] = useState(false)
    const [editStartDate, setEditStartDate] = useState(false)
    const [editDueDate, setEditDueDate] = useState(false)
    const [teamOptions, setTeamOptions] = useState<TeamMember[]>([])
    const [statusOptions, setStatusOptions] = useState<SelectOption<string>[]>([])
    const [parentTaskOptions, setParentTaskOptions] = useState<SelectOption<string>[]>([])
    const [labelDraft, setLabelDraft] = useState<{ taskId: string; value: string } | null>(null)
    const [project] = useSessionStorage<ProjectSession | null>("project", null)
    const role = useRole()
    const { authReady } = useFirebaseAuthBridge()
    const activeProjectId = projectId ?? project?.id
    const taskStatusId = typeof task?.status === "string" ? task.status : task?.status?.id ?? task?.statusId
    const serializedLabels = labelDraft && task && labelDraft.taskId === task.id
        ? labelDraft.value
        : JSON.stringify((task?.labels ?? []).map((label) => ({
            value: label.id,
            content: label.content,
            tagColor: label.backgroundColor,
            style: `--tag-bg:${label.backgroundColor};--tag-text-color:${pickTextColorBasedOnBgColor(label.backgroundColor)};--tag-hover:${label.backgroundColor};--tag-remove-btn-color:${pickTextColorBasedOnBgColor(label.backgroundColor)};--tag-remove-bg:${label.backgroundColor};--tag-remove-btn-bg--hover:${pickTextColorBasedOnBgColor(label.backgroundColor)};--tag-border-radius:99px;`,
        })))

    const taskActions = [
        {
            label: "Ubah Nama Tugas",
            fnCall: () => setUpdateConfirmation(true),
        },
        {
            label: "Hapus Tugas",
            fnCall: () => setDeleteConfirmation(true),
        },
    ]

    useEffect(() => {
        let active = true
        const fetchParentOptions = async() => {
            if (!activeProjectId || !project || !authReady) return
            try {
                const response = await getAllTask(activeProjectId)
                if (!active) return
                const parentOptions = (response.data ?? [])
                    .filter((item) => item.type === "Task")
                    .map((item) => ({ label: `${project.key}-${item.displayId ?? ""} ${item.taskName}`, value: item.id }))
                setParentTaskOptions(parentOptions)
            } catch (error) {
                console.error("Failed to load parent task options", error)
            }
        }
        if(task?.type === "SubTask") void fetchParentOptions()
        return () => { active = false }
    }, [activeProjectId, authReady, project, task?.type])

    useEffect(() => {
        let active = true
        const fetchOptions = async() => {
            if(!activeProjectId || !authReady) return
            try {
                const [teamResponse, statusResponse] = await Promise.all([
                    getAllTeamMember({ projectId: activeProjectId, excludeViewer: true }),
                    getAllTaskStatus(activeProjectId),
                ])
                if (!active) return
                setTeamOptions(teamResponse.data ?? [])
                setStatusOptions((statusResponse.data ?? []).map((status) => ({ label: status.statusName ?? status.status ?? "", value: status.id })))
            } catch (error) {
                console.error("Failed to load task options", error)
            }
        }
        void fetchOptions()
        return () => { active = false }
    }, [activeProjectId, authReady])

    useEffect(() => {
        if(!taskId || !authReady || !activeProjectId) return
        let active = true
        const reference = getDocumentReference({ collectionName: 'tasks', id: taskId })
        const unsubscribe = onSnapshot(reference, async(doc) => {
          try {
            if(doc.exists()){
                const id = doc.id

                const data = doc.data()
                const labelsData = data.labels as string[] | undefined
                const labels = labelsData && await Promise.all(labelsData.map(async (labelId) => {
                    const labelDoc = await getDoc(getDocumentReference({ collectionName: "labels", id: labelId }))

                    return {
                        id: labelDoc.id,
                        ...labelDoc.data()
                    }
                }))
                const parentId = data.parentId as string | undefined
                const parentDoc = parentId ? await getDoc(getDocumentReference({ collectionName: "tasks", id: parentId })) : null
                const parent = parentDoc?.exists() ? { id: parentDoc.id, taskName: String(parentDoc.data().taskName ?? "") } : null

                const assignedToId = data.assignedTo as string | undefined
                const assignedToDoc = assignedToId ? await getDoc(getDocumentReference({ collectionName: "users", id: assignedToId })) : null
                const assignedTo = assignedToDoc?.exists() ? {id: assignedToDoc.id, ...assignedToDoc.data()} as UserSummary : null
                if (!active) return
                setTask({
                    id,
                    ...data,
                    labels: labels ?? [],
                    assignedTo: assignedTo,
                    parent: parent,
                } as TaskDetailTask)
                setTaskNotFound(false)
                return
            }
            if (!active) return
            setTask(null)
            setTaskNotFound(true)
          } catch (error) {
            if (active) console.error("Failed to load task detail", error)
          }
        }, (error) => console.error("Task detail listener failed", error))

        return () => { active = false; unsubscribe() }
    }, [taskId, activeProjectId, authReady])

    const getSelectPriorityClass = () => {
        switch(task?.priority){
            case 0:
                return "border-[#C5C5C5] bg-[#C5C5C5] hover:bg-[#C5C5C5]/80"
            case 1:
                return "border-[#006400] bg-[#006400] hover:bg-[#006400]/80 text-white"
            case 2:
                return "border-[#FFBF00] bg-[#FFBF00] hover:bg-[#FFBF00]/80"
            case 3:
                return "border-[#D2222D] bg-[#D2222D] hover:bg-[#D2222D]/80 text-white"
            default:
                return ""
        }
    }

    const handleAssigneeChange = async(value: { id?: string }) => {
        if (!taskId || !task) return
        setUpdateLoading(true)
        try{
            const assignedToId = typeof task.assignedTo === "string" ? task.assignedTo : task.assignedTo?.id
            if(value?.id !== assignedToId) await updateTask({ taskId, assignedTo: value?.id ?? null })
        }catch(e){
            console.log(e)
        }finally{
            setUpdateLoading(false)
        }
    }

    const handleUpdateTaskName = async(values: { taskName: string }) => {
        if (!taskId || !task) return
        setUpdateLoading(true)

        try{
          if(values.taskName !== task.taskName) await updateTask({ taskId: taskId, taskName: values.taskName })
        }catch(e){
          console.log(e)
        }finally{
          setUpdateConfirmation(false)
          setUpdateLoading(false)
        }
    }

    const handleUpdateStartDate = async(e: ChangeEvent<HTMLInputElement>) => {
        if (!taskId) return
        setUpdateLoading(true)
        try {
            await updateTask({ taskId, startDate: e.target.value || null })
            setEditStartDate(false)
        } catch (error) {
            console.error("Failed to update task start date", error)
        } finally {
            setUpdateLoading(false)
        }
    }

    const handleUpdateDueDate = async(e: ChangeEvent<HTMLInputElement>) => {
        if (!taskId) return
        setUpdateLoading(true)

        try {
            await updateTask({ taskId, dueDate: e.target.value || null })
            setEditDueDate(false)
        } catch (error) {
            console.error("Failed to update task due date", error)
        } finally {
            setUpdateLoading(false)
        }
    }

    const handleUpdateTaskDescription = async(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!taskId || !task) return
        setUpdateLoading(true)

        const formData = new FormData(e.currentTarget)
        const value = formData.get(`task-${taskId}-description`)
        const taskDescription = typeof value === "string" && value.trim() ? value.trim() : null

        try {
            if(taskDescription !== task.description) await updateTask({ taskId, description: taskDescription})
        } catch (error) {
            console.error("Failed to update task description", error)
        } finally {
            setUpdateLoading(false)
            setEditDescription(false)
        }
    }

    const handleStatusChange = async(id: string) => {
        if (!taskId || !task) return
        setUpdateLoading(true)
        try{
            const currentStatusId = typeof task.status === "string" ? task.status : task.status?.id ?? task.statusId
            if(id !== currentStatusId && currentStatusId) {
                await reorderTask({
                    taskId,
                    statusId: currentStatusId,
                    newStatusId: id,
                    oldIndex: task.order ?? 0,
                    newIndex: 0,
                })
            }
        }catch(e){
            console.log(e)
        }finally{
            setUpdateLoading(false)
        }
    }

    const handleParentChange = async(parentId: string | null) => {
        if (!taskId || !task) return
        setUpdateLoading(true)
        try{
            if(parentId && parentId !== task.parentId) {
                await updateTask({ taskId, parentId: parentId})
            }
        }catch(e){
            console.log(e)
        }finally{
            setUpdateLoading(false)
        }
    }

    const handlePriorityChange = async(priority: number) => {
        if (!taskId || !task) return
        setUpdateLoading(true)
        try{
            if(priority !== task.priority) {
                await updateTask({ taskId: taskId, priority: priority})
            }
        }catch(e){
            console.log(e)
        }finally{
            setUpdateLoading(false)
        }
    }

    const handleLabelChange = async() => {
        if (!taskId || !task) return
        let labelArr: Array<{ value?: string }> = []
        try {
            const parsed: unknown = JSON.parse(serializedLabels || "[]")
            if (Array.isArray(parsed)) labelArr = parsed.filter((value): value is { value?: string } => typeof value === "object" && value !== null)
        } catch {
            return
        }
        const newLabelLength = labelArr.length
        const taskLabelLength = (task.labels ?? []).length
        let isDiff = true

        if(newLabelLength === taskLabelLength){
            if(newLabelLength > 0){
                const result = labelArr.every(label1 => (task.labels ?? []).some(label2 => label1.value === label2.id))
                isDiff = !result
            }
            else if (newLabelLength <= 0) isDiff = false
        }

        try{
            if(isDiff){
                setUpdateLoading(true)
                await updateTask({ taskId, labels: serializedLabels === "[]" ? null : serializedLabels})
            }
        }catch(e){
            console.log(e)
        }finally{
            setUpdateLoading(false)
            setEditLabels(false)
        }
    }

    const handleDeleteTask = async() => {
        if (!taskId) return
        setUpdateLoading(true)

        try{
            const res = await deleteTask({ taskId: taskId })

            if(res.success && closeFn) closeFn()
        }catch(e){
            console.log(e)
        }finally{
            setDeleteConfirmation(false)
            setUpdateLoading(false)
        }
    }

    if(taskNotFound) return(
        <EmptyState message="Tugas tidak dapat ditemukan."/>
    )

    if(!task) return(
        <div className="w-full h-full flex flex-col gap-4 justify-center items-center">
            <TailSpin
                color="#47389F"
                height={100}
                width={100}
            />
            <p className="text-sm md:text-base text-dark-blue/80">Memuat data tugas..</p>
        </div>
    )

    const validateMember = validateUserRole({ userRole: role, minimumRole: 'Member' })
    const userSelectOptions = teamOptions.flatMap((member) => {
        const user = member.user
        return user?.fullName ? [{ user: { id: user.id ?? member.userId, fullName: user.fullName, profileImage: user.profileImage } }] : []
    })
    return(
        <div className={`w-full h-full flex flex-col gap-3 md:gap-6 px-4 py-4 md:px-8 md:py-6 bg-white text-dark-blue rounded-lg shadow-lg overflow-y-auto`}>
            {updateLoading && <PopUpLoad/>}
            {editLabels &&
            <PopUpForm
                title={"Ubah Label"}
                wrapContent
            >
                <div>
                    <LabelInput
                        hideLabel
                        projectId={activeProjectId ?? task.projectId}
                        labelData={serializedLabels}
                        onChange={(event) => setLabelDraft({ taskId: task.id, value: event.detail.value })}
                    />
                    <div className="mt-4 flex justify-end gap-2 md:gap-4">
                        <Button variant="danger" onClick={() => setEditLabels(false)}
                        >Batal</Button>
                        <Button variant="primary" onClick={handleLabelChange}>Ubah</Button>
                    </div>
                </div>
            </PopUpForm>}
            {updateConfirmation &&
              <UpdateTaskNameForm
                taskName={task.taskName}
                onSubmit={handleUpdateTaskName}
                onClose={() => setUpdateConfirmation(false)}
              />}
            {deleteConfirmation &&
              (<PopUpForm
                title={"Hapus Tugas"}
                message={'Apakah Anda yakin ingin menghapus tugas ini?'}
                wrapContent
              >
                <>
                  <div className="mt-4 flex justify-end gap-2 md:gap-4">
                    <Button variant="danger" onClick={handleDeleteTask}>Hapus</Button>
                    <Button variant="secondary" onClick={() => setDeleteConfirmation(false)}
                    >Batal</Button>
                  </div>
                </>
              </PopUpForm>)}
            <div className="flex items-start gap-4">
                <div className="flex items-end flex-grow">
                    <div className={`text-lg md:text-2xl font-semibold text-dark-blue`}>
                        {project && <span>[{project.key}-{task.displayId}]</span>} {task.taskName}
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    {validateMember &&
                    <DotButton
                        name={`task-detail-${taskId}`}
                        actions={taskActions}
                    />}
                    {closeFn && <button onClick={closeFn}><CloseIcon size={32} className="text-basic-blue"/></button>}
                </div>
            </div>
            <div className="h-full flex flex-col overflow-x-hidden overflow-y-auto gap-4 md:gap-6 pr-4 -mr-4 md:pr-8 md:-mr-8 custom-scrollbar">
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-3 gap-2">
                        <p className="font-semibold text-xs md:text-sm pt-2">Penerima</p>
                        <div className="col-span-2">
                            <UserSelectButton
                                name={`assignedToDetail-${taskId}`}
                                type="button"
                                defaultValue={task.assignedTo}
                                options={userSelectOptions}
                                onChange={handleAssigneeChange}
                                disabled={!validateMember}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold pt-2">Label</p>
                        <div className="col-span-2">
                            <div
                                className={`flex flex-wrap gap-1 md:gap-2 w-full p-2 cursor-pointer hover:bg-gray-200 rounded transition-colors duration-300`}
                                onClick={validateMember ? () => setEditLabels(true) : undefined}
                            >
                                {task.labels && task.labels.length > 0 ?
                                task.labels.map(label => (
                                    <Label key={label.id} text={label.content} color={label.backgroundColor}/>
                                )) :
                                <p className="text-xs md:text-sm text-dark-blue/80">Belum ada label yang ditambahkan..</p>}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold pt-2">Tanggal Mulai</p>
                        <div className="col-span-2">
                            {!editStartDate ?
                            <p
                                className="w-full p-2 cursor-pointer text-dark-blue/80 hover:bg-gray-200 rounded transition-colors duration-300"
                                onClick={validateMember ? () => setEditStartDate(true) : undefined}
                            >
                                {dateFormat(task.startDate ?? null) ?? "Belum diatur"}
                            </p> :
                            <SimpleDateForm
                                name={`task-${taskId}-start-date`}
                                value={toDateInput(task.startDate)}
                                max={toDateInput(task.dueDate)}
                                onChange={handleUpdateStartDate}
                                onCancel={() => setEditStartDate(false)}
                            />}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold pt-2">Tenggat Waktu</p>
                        <div className="col-span-2">
                            {!editDueDate ?
                            <p
                                className="w-full p-2 cursor-pointer text-dark-blue/80 hover:bg-gray-200 rounded transition-colors duration-300"
                                onClick={validateMember ? () => setEditDueDate(true) : undefined}
                            >
                                {dateFormat(task.dueDate ?? null) ?? "Belum diatur"}
                            </p> :
                            <SimpleDateForm
                                name={`task-${taskId}-start-date`}
                                value={toDateInput(task.dueDate)}
                                min={toDateInput(task.startDate)}
                                onChange={handleUpdateDueDate}
                                onCancel={() => setEditDueDate(false)}
                            />}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold pt-2">Prioritas</p>
                        <div className="col-span-2">
                            <SelectButton
                                name={`task-${taskId}-priority`}
                                defaultValue={priorityList.find(priority => priority.value === task.priority)}
                                options={priorityList.map(({ label, value }) => ({ label, value }))}
                                onChange={handlePriorityChange}
                                disabled={!validateMember}
                                buttonClass={getSelectPriorityClass()}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold pt-2">Status</p>
                        <div className="col-span-2">
                            <SelectButton
                                name={`task-${taskId}-status`}
                                defaultValue={statusOptions.find(status => status.value === taskStatusId)}
                                options={statusOptions}
                                disabled={!validateMember}
                                onChange={handleStatusChange}
                            />
                        </div>
                    </div>
                    {task.type === "SubTask" &&
                    <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                        <p className="font-semibold pt-2">Induk Tugas</p>
                        <div className="col-span-2">
                            <ParentSelectButton
                                name={`task-${taskId}-parent`}
                                defaultValue={parentTaskOptions.find(t=> t.value === task.parentId)}
                                disabled={!validateMember}
                                options={parentTaskOptions}
                                onChange={handleParentChange}
                            />
                        </div>
                    </div>}
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col items-start gap-2">
                        <p className="font-semibold text-xs md:text-sm">Deskripsi Tugas</p>
                        {!editDescription ?
                        <p
                            className="w-full cursor-pointer text-xs md:text-sm text-dark-blue/80 hover:bg-gray-200 p-2 rounded transition-colors duration-300"
                            onClick={validateMember ? () => setEditDescription(true) : undefined}
                        >
                            {task.description ? task.description : "Tambahkan deskripsi tugas..."}
                        </p> :
                        <SimpleTextareaForm
                            name={`task-${taskId}-description`}
                            max={1000}
                            onSubmit={handleUpdateTaskDescription}
                            onBlur={() => setEditDescription(false)}
                            placeholder={"Masukkan deskripsi tugas..."}
                            defaultValue={task.description ?? undefined}
                        />}
                    </div>
                    <ChatSection taskId={taskId ?? task.id} projectId={activeProjectId ?? task.projectId} title={task.taskName}/>
                    <AttachmentSection taskId={taskId ?? task.id} projectId={activeProjectId ?? task.projectId}/>
                    {task.type === "Task" && <SubtaskSection projectId={activeProjectId ?? task.projectId} taskId={taskId ?? task.id} statusOptions={statusOptions} teamOptions={teamOptions}/>}
                    <ActivitySection taskId={taskId ?? task.id} projectId={activeProjectId ?? task.projectId}/>
                </div>
            </div>
        </div>
    )
}

export default memo(TaskDetail)
