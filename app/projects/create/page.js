
import Header from "@/app/components/common/Header"
import DashboardLayout from "@/app/components/layout/DashboardLayout"
import CreateProjectContent from "@/app/components/projects/CreateProjectContent"

export default function CreateProjectPage(){

    return(
        <DashboardLayout>
            <div className="max-w-4xl h-full flex flex-col items-start mx-auto">
                <Header title={"Buat Proyek"}/>
                <CreateProjectContent/>
            </div>
        </DashboardLayout>
    )
}