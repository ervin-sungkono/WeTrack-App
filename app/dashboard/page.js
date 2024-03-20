import Header from "../components/common/Header";
import DashboardLayout from "../components/layout/DashboardLayout";

export default function DashboardPage(){
    const links = [
        {label: "Beranda", url: "/"},
        {label: "Hubungi Kami", url: "/contact"},
    ]

    return(
        <DashboardLayout hideMenu={false}>
            <div className="flex flex-col gap-4">
                <Header title={"Dasbor"} links={links}/>
            </div>
        </DashboardLayout>
    )
}