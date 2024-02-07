// View All Project Page
import Header from "../components/common/Header"
import ProjectLayout from "../components/common/layout/ProjectLayout"
import SearchBar from "../components/common/SearchBar"
import ProjectContent from "../components/projects/ProjectContent"

export default function ProjectsPage(){
    // TODO: Integrate with API
    // TODO: Add styling and placeholder view
    return(
        <ProjectLayout hideMenu={false}>
            <Header title={"Projects"}/>
            <ProjectContent/>
        </ProjectLayout>
    )
}