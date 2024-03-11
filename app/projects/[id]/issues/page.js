// Issue Page
import ProjectLayout from "@/app/components/layout/ProjectLayout"

export default function IssuesPage({ params: { id } }){
    return(
        <ProjectLayout projectId={id}>
            Issues
        </ProjectLayout>
    )
}