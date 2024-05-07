// Timeline Page
import Header from "@/app/components/common/Header"
import ProjectLayout from "@/app/components/layout/ProjectLayout"
import TimelineContent from "@/app/components/projects/timeline/TimelineContent"

export default function TimelinePage({ params: { id } }){
    const links = [
        { url: "/projects", label: "Proyek" },
        { url: `/projects/${id}`, label: "Nama Proyek" }
    ]

    return(
        <ProjectLayout projectId={id}>
            <Header title={"Jadwal"} links={links}/>
            <TimelineContent projectId={id}/>
        </ProjectLayout>
    )
}