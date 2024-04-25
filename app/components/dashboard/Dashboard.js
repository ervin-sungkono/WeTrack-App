import Header from "../common/Header"
import DashboardLayout from "../layout/DashboardLayout"
import DashboardInsight from "./DashboardInsight"
import DashboardTaskList from "./DashboardTaskList"

export default function Dashboard(){
    const links = [
        {label: "Beranda", url: "/"},
        {label: "Dasbor", url: "/dashboard"},
    ]

    const dummyProjectList = [
        {
            name: "My First Project",
            amount: 2
        },
        {
            name: "My Second Project",
            amount: 4
        },
        {
            name: "WeTrack",
            amount: 17
        },
        {
            name: "Binusmaya",
            amount: 8
        },
    ]

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-4">
                <Header title={"Dasbor"} links={links}/>     
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full mt-4">
                <div className="w-full md:w-1/4">
                    <DashboardInsight />
                </div>
                <div className="w-full md:w-3/4">
                    <DashboardTaskList list={dummyProjectList} />
                </div>
            </div>
        </DashboardLayout> 
    )
}