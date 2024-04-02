// Task Page
import ProjectLayout from "@/app/components/layout/ProjectLayout"

export default function TasksPage({ params: { id } }){
    return(
        <ProjectLayout projectId={id}>
            Tugas
        </ProjectLayout>
    )
}