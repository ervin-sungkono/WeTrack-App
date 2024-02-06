import Header from "../components/common/Header";
import MainLayout from "../components/common/layout/MainLayout";

export default function DashboardPage(){
    const links = [
        {label: "Home", url: "/"},
        {label: "Contact Us", url: "/contact"},
    ]
    return(
        <MainLayout hideMenu={false}>
            <div className="flex flex-col gap-4 pt-6 pb-8">
                <Header title={"Dashboard"} links={links}/>
            </div>
        </MainLayout>
    )
}