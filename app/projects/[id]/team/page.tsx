// Team Page
"use client"

import { use } from "react"
import Header from "@/app/components/common/Header"
import ProjectLayout from "@/app/components/layout/ProjectLayout"
import TeamContent from "@/app/components/projects/team/TeamContent"

type TeamPageProps = { params: Promise<{ id: string }> }

export default function TeamPage({ params }: TeamPageProps){
    const { id } = use(params)
    const links = [
        { url: "/projects", label: "Proyek" },
        { url: `/projects/${id}`, label: "Nama Proyek" }
    ]

    return(
        <ProjectLayout projectId={id}>
            <Header title={"Tim"} links={links}/>
            <TeamContent projectId={id}/>
        </ProjectLayout>
    )
}
