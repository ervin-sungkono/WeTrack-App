// View All Project Page
import Header from "../components/common/Header"
import DashboardLayout from "../components/layout/DashboardLayout"
import ProjectContent from "../components/projects/ProjectContent"

export default async function ProjectsPage(){
    return(
        <DashboardLayout hideMenu={false}>
            <Header title={"Proyek"}/>
            <ProjectContent/>
        </DashboardLayout>
    )
}