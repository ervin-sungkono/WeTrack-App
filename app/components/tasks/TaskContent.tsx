"use client"
import { useEffect, useState } from "react"

import TaskDetail from "../projects/task/TaskDetail"
import TaskList from "./TaskList"
import SearchBar from "../common/SearchBar"
import SelectButton from "../common/button/SelectButton"
import EmptyState from "../common/EmptyState"
import Button from "../common/button/Button"

import { IoFilter as FilterIcon } from "react-icons/io5"
import { FaFilterCircleXmark as CloseFilterIcon } from "react-icons/fa6";
import { onSnapshot, getDoc } from "firebase/firestore"
import { getQueryReferenceOrderBy, getDocumentReference } from "@/app/firebase/util"
import { getAllTeamMember } from "@/app/lib/fetch/team"
import { getAllLabel } from "@/app/lib/fetch/label"
import { getAllTaskStatus } from "@/app/lib/fetch/taskStatus"
import type { UserSummary } from "@/app/types/domain"
import type { SelectOption, TaskListTask } from "../types"
import { useFirebaseAuthBridge } from "@/app/components/providers/AuthProviders"

interface TaskContentProps {
    projectId: string
    taskId?: string | null
}

type ProjectOptions = { projectId: string; options: SelectOption[] }

export default function TaskContent({ projectId, taskId }: TaskContentProps){
    const [query, setQuery] = useState("")
    const [filterDropdown, setFilterDropdown] = useState(false)
    const [taskState, setTaskState] = useState<{ projectId: string; tasks: TaskListTask[] } | null>(null)

    const [teamOptionsState, setTeamOptionsState] = useState<ProjectOptions | null>(null)
    const [statusOptionsState, setStatusOptionsState] = useState<ProjectOptions | null>(null)
    const [labelOptionsState, setLabelOptionsState] = useState<ProjectOptions | null>(null)
    const [filterAssignee, setFilterAssignee] = useState<string | null>(null)
    const [filterStatus, setFilterStatus] = useState<string | null>(null)
    const [filterLabel, setFilterLabel] = useState<string | null>(null)
    const { authReady } = useFirebaseAuthBridge()
    const tasks = authReady && taskState?.projectId === projectId ? taskState.tasks : []
    const teamOptions = teamOptionsState?.projectId === projectId ? teamOptionsState.options : []
    const statusOptions = statusOptionsState?.projectId === projectId ? statusOptionsState.options : []
    const labelOptions = labelOptionsState?.projectId === projectId ? labelOptionsState.options : []

    const handleSearch = (query: string) => {
        setQuery(query.toLowerCase())
    }

    useEffect(() => {
        if(!projectId || !authReady) return

        const reference = getQueryReferenceOrderBy({ collectionName: "tasks", field: "projectId", id: projectId, orderByKey: 'order' })
        let active = true
        let latestSnapshot = 0
        const unsubscribe = onSnapshot(reference, (snapshot) => {
            const snapshotVersion = ++latestSnapshot
            const readTasks = async () => Promise.all(snapshot.docs.map(async (taskDocument) => {
                const task = taskDocument.data()
                const assignedToId = task.assignedTo
                const assignedToDocument = assignedToId
                    ? await getDoc(getDocumentReference({ collectionName: "users", id: assignedToId }))
                    : null
                const assignedTo: UserSummary | null = assignedToDocument?.exists() ? {
                    id: assignedToDocument.id,
                    fullName: assignedToDocument.data().fullName,
                    profileImage: assignedToDocument.data().profileImage,
                } : null

                return {
                    ...task,
                    id: taskDocument.id,
                    assignedTo,
                } satisfies TaskListTask
            }))

            void readTasks().then((updatedTasks) => {
                if (active && snapshotVersion === latestSnapshot) setTaskState({ projectId, tasks: updatedTasks })
            }).catch((error: unknown) => {
                if (active && snapshotVersion === latestSnapshot) {
                    console.error("Unable to load project tasks.", error)
                }
            })
        }, (error) => {
            if (active) console.error("Unable to subscribe to project tasks.", error)
        })

        return () => {
            active = false
            unsubscribe()
        }
    }, [projectId, authReady])

    useEffect(() => {
        if(!projectId || !authReady) return
        let active = true

        void getAllTeamMember({ projectId, excludeViewer: true }).then((teamData) => {
            if (!active) return
            setTeamOptionsState({
                projectId,
                options: (teamData.data ?? []).map(team => ({
                    value: team.userId,
                    label: team.user?.fullName ?? team.email ?? "",
                })),
            })
        }).catch((error: unknown) => {
            if (active) console.error("Unable to load project team options.", error)
        })

        void getAllTaskStatus(projectId).then((statusData) => {
            if (!active) return
            setStatusOptionsState({
                projectId,
                options: (statusData.data ?? []).map(status => ({
                    value: status.id,
                    label: status.statusName ?? status.status ?? "",
                })),
            })
        }).catch((error: unknown) => {
            if (active) console.error("Unable to load task status options.", error)
        })

        void getAllLabel({ projectId }).then((labelData) => {
            if (!active) return
            setLabelOptionsState({
                projectId,
                options: (labelData.data ?? []).map(label => ({
                    value: label.id,
                    label: label.content,
                })),
            })
        }).catch((error: unknown) => {
            if (active) console.error("Unable to load task label options.", error)
        })

        return () => { active = false }
    }, [projectId, authReady])

    const handleAssigneeChange = (val: string | null) => {
        setFilterAssignee(val)
    }

    const handleStatusChange = (val: string | null) => {
        setFilterStatus(val)
    }

    const handleLabelChange = (val: string | null) => {
        setFilterLabel(val)
    }

    const filterTaskData = (taskData: TaskListTask[]) => {
        const filterBySearch = taskData.filter(task => task.taskName.toLowerCase().includes(query))

        const filterByAssignee = filterAssignee ? filterBySearch.filter(task => task.assignedTo?.id === filterAssignee) : filterBySearch

        const filterByStatus = filterStatus ? filterByAssignee.filter(task =>
            typeof task.status === "string" ? task.status === filterStatus : task.status?.id === filterStatus
        ) : filterByAssignee

        const filterByLabel = filterLabel ? filterByStatus.filter(task => task.labels?.some(label =>
            typeof label === "string" ? label === filterLabel : label.id === filterLabel
        ) ?? false) : filterByStatus

        return filterByLabel
    }

    const visibleTasks = filterTaskData(tasks)

    const resetFilter = () =>{
        setFilterAssignee(null)
        setFilterStatus(null)
        setFilterLabel(null)
    }

    return(
        <div className="w-full h-full flex flex-col gap-2.5 sm:gap-4 overflow-y-auto">
            <div className="flex flex-col xs:flex-row justify-between gap-4 items-center z-50">
                <div className="w-full flex justify-center md:justify-start items-center gap-3 md:gap-6 z-fixed">
                    <SearchBar placeholder={"Cari tugas..."} handleSearch={handleSearch}/>
                    <div className="relative">
                        <button className="block md:hidden text-white bg-basic-blue hover:bg-basic-blue/80 rounded-md p-1.5" onClick={() => setFilterDropdown(current => !current)}>
                            <FilterIcon size={20}/>
                        </button>
                        <div className={`${filterDropdown ? "block" : "hidden"} border border-dark-blue/30 md:border-none md:flex z-50 absolute -bottom-2 right-0 translate-y-full md:translate-y-0 px-2 py-3 bg-white rounded-md md:bg-transparent md:p-0 md:static flex flex-col md:flex-row gap-2 md:gap-4`}>
                            <SelectButton
                                placeholder={"Penerima"}
                                name={"task-assignee-button"}
                                options={[{label: "Penerima", value: null},...teamOptions]}
                                onChange={handleAssigneeChange}
                                reset={!filterAssignee}
                            />
                            <SelectButton
                                placeholder={"Status"}
                                name={"task-status-button"}
                                options={[{label: "Status", value: null},...statusOptions]}
                                onChange={handleStatusChange}
                                reset={!filterStatus}
                            />
                            <SelectButton
                                placeholder={"Label"}
                                name={"task-label-button"}
                                options={[{label: "Label", value: null},...labelOptions]}
                                onChange={handleLabelChange}
                                reset={!filterLabel}
                            />
                            {(filterAssignee || filterStatus || filterLabel) &&
                            <Button variant="primary" size="sm" onClick={() => resetFilter()}>
                                <div className="flex items-center gap-2">
                                <CloseFilterIcon size={16}/>
                                <p>Hapus Filter</p>
                                </div>
                            </Button>}
                        </div>
                    </div>
                </div>
            </div>
            {
                visibleTasks.length > 0 ?
                <div className="h-full flex flex-col sm:flex-row gap-2 sm:gap-4 overflow-hidden sm:overflow-y-auto">
                    <TaskList tasks={visibleTasks} taskId={taskId ?? visibleTasks[0]?.id}/>
                    <TaskDetail taskId={taskId ?? visibleTasks[0]?.id} projectId={projectId} />
                </div>
                :
                <EmptyState message={tasks.length > 0 ? "Tidak ada tugas yang sesuai dengan filter." : "Belum ada tugas yang dibuat."}/>
            }
        </div>
    )
}
