"use client"

import { useEffect, useState } from "react"
import type { DashboardProject, DashboardTask } from "../types"
import type { FirestoreTimestampLike, Project, Task } from "@/app/types/domain"
import Header from "../common/Header"
import DashboardLayout from "../layout/DashboardLayout"
import DashboardInsight from "./DashboardInsight"
import DashboardTaskList from "./DashboardTaskList"
import { getAllProject } from "@/app/lib/fetch/project"
import { getAllTask } from "@/app/lib/fetch/task"
import PopUpLoad from "../common/alert/PopUpLoad"
import EmptyState from "../common/EmptyState"
import { getDocumentReference } from "@/app/firebase/util"
import { getDoc } from "firebase/firestore"
import { getUserProfile } from "@/app/lib/fetch/user"

function timestampToMillis(value: FirestoreTimestampLike | undefined): number {
    if (!value) return 0
    if (value instanceof Date) return value.getTime()
    if (typeof value === "number") return value
    if (typeof value === "string") return Date.parse(value) || 0
    if (typeof value === "object") {
        if ("toDate" in value && typeof value.toDate === "function") {
            return value.toDate().getTime()
        }
        if ("seconds" in value) return value.seconds * 1000
    }
    return 0
}

async function getStatusName(statusId?: string | null): Promise<string | null> {
    if (!statusId) return null
    const snapshot = await getDoc(getDocumentReference({ collectionName: "taskStatuses", id: statusId }))
    const status = snapshot.data() as { statusName?: string } | undefined
    return snapshot.exists() ? status?.statusName ?? null : null
}

export default function Dashboard(){
    const links = [
        {label: "Beranda", url: "/"},
        {label: "Dasbor", url: "/dashboard"},
    ]

    const [userId, setUserId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [projectsData, setProjectsData] = useState<DashboardProject[]>([])
    const [selectedProject, setSelectedProject] = useState<DashboardProject | null>(null)

    useEffect(() => {
        let active = true
        getUserProfile()
            .then((res) => {
                if (!active) return
                if (!res.data?.uid) {
                    console.error("User profile is unavailable")
                    setLoading(false)
                    return
                }
                setUserId(res.data.uid)
            })
            .catch((error: unknown) => {
                if (active) {
                    console.error("Failed to load user profile", error)
                    setLoading(false)
                }
            })
        return () => { active = false }
    }, [])

    useEffect(() => {
        if (!userId) return
        let active = true

        const loadDashboard = async () => {
            setLoading(true)
            try {
                const projectResponse = await getAllProject()
                const projects = Array.isArray(projectResponse?.data)
                    ? projectResponse.data as Project[]
                    : []

                const projectsWithTasks = await Promise.all(projects.map(async (project): Promise<DashboardProject> => {
                    const [startStatus, endStatus, taskResponse] = await Promise.all([
                        getStatusName(project.startStatus),
                        getStatusName(project.endStatus),
                        getAllTask(project.id),
                    ])
                    const tasks = Array.isArray(taskResponse?.data)
                        ? taskResponse.data as Task[]
                        : []
                    const assignedTasks = tasks
                        .filter((task) => task.assignedTo === userId)
                        .sort((left, right) => timestampToMillis(right.createdAt) - timestampToMillis(left.createdAt))

                    return {
                        ...project,
                        startStatus,
                        endStatus,
                        tasks: assignedTasks as DashboardTask[],
                    }
                }))

                const visibleProjects = projectsWithTasks
                    .filter((project) => project.tasks.length > 0)
                    .sort((left, right) => timestampToMillis(right.createdAt) - timestampToMillis(left.createdAt))

                if (active) {
                    setProjectsData(visibleProjects)
                    setSelectedProject(visibleProjects[0] ?? null)
                }
            } catch (error) {
                if (active) {
                    console.error("Failed to load dashboard data", error)
                    setProjectsData([])
                    setSelectedProject(null)
                }
            } finally {
                if (active) setLoading(false)
            }
        }

        void loadDashboard()
        return () => { active = false }
    }, [userId])

    if(loading){
        return <PopUpLoad />
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col md:h-full">
                <div className="flex flex-col gap-4">
                    <Header title={"Dasbor"} links={links}/>
                </div>
                {projectsData.length > 0 ? (
                    <div className="flex flex-grow flex-col-reverse md:flex-row gap-4 w-full md:h-full md:overflow-y-auto mt-4 mb-8 md:mb-0">
                        <div className="w-full md:h-full md:w-1/2 md:overflow-y-auto custom-scrollbar">
                            {selectedProject && <DashboardInsight project={selectedProject}/>}
                        </div>
                        <div className="w-full md:h-full md:w-1/2 md:overflow-y-auto">
                            <DashboardTaskList list={projectsData} selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
                        </div>
                    </div>
                ) : (
                    <div className="mt-12 flex flex-col justify-center items-center text-center">
                        <EmptyState
                            message={"Belum ada data proyek yang tersedia untuk ditampilkan dalam dasbor."}
                            action={"Buat Proyek Baru Sekarang"}
                            href={`/projects/create`}
                        />
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
