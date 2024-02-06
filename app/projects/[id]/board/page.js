// Board Page
import ProjectLayout from "@/app/components/common/layout/ProjectLayout"

export default function BoardPage({ params: { id } }){
    console.log(id)
    return(
        <ProjectLayout>
            Board
        </ProjectLayout>
    )
}