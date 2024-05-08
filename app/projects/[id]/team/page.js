// Team Page
"use client"

import Header from "@/app/components/common/Header"
import ProjectLayout from "@/app/components/layout/ProjectLayout"
import TeamContent from "@/app/components/projects/team/TeamContent"
import { SessionProvider } from "next-auth/react"

export default function TeamPage({ params: { id } }){
    const links = [
        { url: "/projects", label: "Proyek" },
        { url: `/projects/${id}`, label: "Nama Proyek" }
    ]

    return(
        <SessionProvider>
            <ProjectLayout projectId={id}>
                <Header title={"Tim"} links={links}/>
                <TeamContent projectId={id}/>
            </ProjectLayout>
        </SessionProvider>
    )
}