// View All Project Page
import Header from "../components/common/Header"
import DashboardLayout from "../components/layout/DashboardLayout"
import ProjectContent from "../components/projects/ProjectContent"

export default function ProjectsPage(){
    // TODO: Integrate with API
    // TODO: Add styling and placeholder view
    return(
        <DashboardLayout hideMenu={false}>
            <Header title={"Projects"}/>
            <ProjectContent/>
        </DashboardLayout>
    )
}