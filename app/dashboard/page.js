import Header from "../components/common/Header";
import DashboardLayout from "../components/layout/DashboardLayout";

export default function DashboardPage(){
    const links = [
        {label: "Home", url: "/"},
        {label: "Contact Us", url: "/contact"},
    ]

    return(
        <DashboardLayout hideMenu={false}>
            <div className="flex flex-col gap-4">
                <Header title={"Dashboard"} links={links}/>
            </div>
        </DashboardLayout>
    )
}