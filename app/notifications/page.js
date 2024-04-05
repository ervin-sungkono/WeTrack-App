import Header from "../components/common/Header";
import SelectButton from "../components/common/SelectButton";
import NotificationsLayout from "../components/layout/NotificationsLayout";

export default function NotificationsPage(){
    const links = [
        {label: "Beranda", url: "/"},
        {label: "Notifikasi", url: "/notifications"},
    ]

    return (
        <NotificationsLayout>
            <div className="flex flex-col gap-4">
                <Header title={"Notifikasi"} links={links}/>
            </div>
        </NotificationsLayout>
    )
}