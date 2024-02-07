import Header from "../components/common/Header";
import ProjectLayout from "../components/common/layout/ProjectLayout";

export default function DashboardPage(){
    const links = [
        {label: "Home", url: "/"},
        {label: "Contact Us", url: "/contact"},
    ]

    return(
        <ProjectLayout hideMenu={false}>
            <div className="flex flex-col gap-4 pt-6 pb-8">
                <Header title={"Dashboard"} links={links}/>
            </div>
        </ProjectLayout>
    )
}