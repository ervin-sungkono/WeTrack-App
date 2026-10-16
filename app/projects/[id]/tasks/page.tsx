// Task Page
"use client"
import { use } from "react"
import ProjectLayout from "@/app/components/layout/ProjectLayout"
import Header from "@/app/components/common/Header"
import TaskContent from "@/app/components/tasks/TaskContent"

type TasksPageProps = {
    params: Promise<{ id: string }>
    searchParams: Promise<{ taskId?: string | string[] }>
}

export default function TasksPage({ params, searchParams }: TasksPageProps){
    const { id } = use(params)
    const { taskId } = use(searchParams)
    const selectedTaskId = Array.isArray(taskId) ? taskId[0] : taskId
    const links = [
        { url: "/projects", label: "Proyek" },
        { url: `/projects/${id}`, label: "Nama Proyek" }
    ]

    return(
        <ProjectLayout projectId={id}>
            <Header title={"Tugas"} links={links}/>
            <TaskContent projectId={id} taskId={selectedTaskId}/>
        </ProjectLayout>
    )
}
