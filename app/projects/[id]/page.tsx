// Overview Page
"use client"

import { use } from "react"
import Header from "@/app/components/common/Header"
import ProjectLayout from "@/app/components/layout/ProjectLayout"
import OverviewContent from "@/app/components/projects/overview/OverviewContent"

type OverviewPageProps = { params: Promise<{ id: string }> }

export default function OverviewPage({ params }: OverviewPageProps){
    const { id } = use(params)
    const links = [
        { url: "/projects", label: "Proyek" },
        { url: `/projects/${id}`, label: "Nama Proyek" }
    ]

    return(
        <ProjectLayout projectId={id}>
            <Header title={"Ringkasan"} links={links}/>
            <OverviewContent projectId={id}/>
        </ProjectLayout>
    )
}
