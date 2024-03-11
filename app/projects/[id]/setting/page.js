// Project Setting Page
import ProjectLayout from "@/app/components/layout/ProjectLayout"

export default function SettingPage({ params: { id } }){
    return(
        <ProjectLayout projectId={id}>
            Setting
        </ProjectLayout>
    )
}