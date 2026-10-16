// Board Page
"use client"
import { use } from "react"
import ProjectLayout from "@/app/components/layout/ProjectLayout"
import Header from "@/app/components/common/Header"
import BoardContent from "@/app/components/projects/board/BoardContent"
import { TaskProvider } from "@/app/lib/context/task"

type BoardPageProps = { params: Promise<{ id: string }> }

export default function BoardPage({ params }: BoardPageProps){
    const { id } = use(params)
    const links = [
        { url: "/projects", label: "Proyek" },
        { url: `/projects/${id}`, label: "Nama Proyek" }
    ]

    return(
        <ProjectLayout projectId={id}>
            <Header title={"Papan Kanban"} links={links}/>
            <TaskProvider>
                <BoardContent projectId={id}/>
            </TaskProvider>
        </ProjectLayout>
    )
}
