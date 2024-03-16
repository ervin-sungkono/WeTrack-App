// Team Page
import Header from "@/app/components/common/Header"
import ProjectLayout from "@/app/components/layout/ProjectLayout"
import TeamContent from "@/app/components/projects/team/TeamContent"

export default function TeamPage({ params: { id } }){
    const links = [
        { url: "/projects", label: "Projects" },
        { url: `/projects/${id}`, label: "Project Name" }
    ]

    return(
        <ProjectLayout projectId={id}>
            <Header title={"Team"} links={links}/>
            <TeamContent/>
        </ProjectLayout>
    )
}