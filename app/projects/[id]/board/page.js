// Board Page
import ProjectLayout from "@/app/components/layout/ProjectLayout"

export default function BoardPage({ params: { id } }){
    console.log(id)
    return(
        <ProjectLayout>
            Board
        </ProjectLayout>
    )
}