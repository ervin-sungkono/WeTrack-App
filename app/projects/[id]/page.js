// Overview Page
import Header from "@/app/components/common/Header"
import ProjectLayout from "@/app/components/layout/ProjectLayout"
import OverviewContent from "@/app/components/projects/overview/OverviewContent"

export default function OverviewPage({ params: { id } }){
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