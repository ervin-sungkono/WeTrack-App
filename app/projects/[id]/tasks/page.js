// Task Page
"use client"
import ProjectLayout from "@/app/components/layout/ProjectLayout"
import Header from "@/app/components/common/Header"
import TaskContent from "@/app/components/tasks/TaskContent"

export default function TasksPage({ params: { id }, searchParams: { taskId } }){
    const links = [
        { url: "/projects", label: "Proyek" },
        { url: `/projects/${id}`, label: "Nama Proyek" }
    ]

    console.log(taskId)
    
    return(
        <ProjectLayout projectId={id}>
            <Header title={"Tugas"} links={links}/>
            <TaskContent projectId={id} taskId={taskId}/>
        </ProjectLayout>
    )
}