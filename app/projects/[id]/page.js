// Overview Page
import ProjectLayout from "@/app/components/layout/ProjectLayout"

export default function OverviewPage({ params: { id } }){
    return(
        <ProjectLayout projectId={id}>
            Ikhtisar
        </ProjectLayout>
    )
}