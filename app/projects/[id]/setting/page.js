// Project Setting Page
import Header from "@/app/components/common/Header"
import ProjectLayout from "@/app/components/layout/ProjectLayout"
import SettingContent from "@/app/components/projects/setting/SettingContent"

export default function SettingPage({ params: { id } }){
    const links = [
        { url: "/projects", label: "Proyek" },
        { url: `/projects/${id}`, label: "Nama Proyek" }
    ]

    return(
        <ProjectLayout projectId={id}>
            <Header title={"Pengaturan"} links={links}/>
            <SettingContent projectId={id}/>
        </ProjectLayout>
    )
}