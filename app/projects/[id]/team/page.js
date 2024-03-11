// Team Page
import ProjectLayout from "@/app/components/layout/ProjectLayout"

export default function TeamPage({ params: { id } }){
    return(
        <ProjectLayout projectId={id}>
            Team
        </ProjectLayout>
    )
}