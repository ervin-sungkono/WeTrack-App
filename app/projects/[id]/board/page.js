// Board Page
import ProjectLayout from "@/app/components/layout/ProjectLayout"
import Header from "@/app/components/common/Header"
import BoardContent from "@/app/components/projects/board/BoardContent"

export default function BoardPage({ params: { id } }){
    const links = [
        { url: "/projects", label: "Proyek" },
        { url: `/projects/${id}`, label: "Nama Proyek" }
    ]

    return(
        <ProjectLayout projectId={id}>
            <Header title={"Papan"} links={links}/>
            {/* TODO: Develop Board untuk Board Page */}
            <BoardContent/>
        </ProjectLayout>
    )
}