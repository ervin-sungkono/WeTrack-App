// Timeline Page
import ProjectLayout from "@/app/components/layout/ProjectLayout"

export default function TimelinePage({ params: { id } }){
    return(
        <ProjectLayout projectId={id}>
            Timeline
        </ProjectLayout>
    )
}