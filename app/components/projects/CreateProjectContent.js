"use client"
import MultiStepForm from "@/app/components/common/form/MultiStepForm"
import ProjectTemplate from "@/app/components/common/form/project/ProjectTemplate"
import ProjectInformation from "@/app/components/common/form/project/ProjectInformation"
import TeamMember from "../common/form/project/TeamMember"
import { ProjectProvider } from "@/app/lib/context/project"

export default function CreateProjectContent(){
    const steps = [
        {
            label: "Pilih Template Proyek",
            Form: (props) => 
                <ProjectTemplate {...props}/>
        },
        {
            label: "Undang Anggota Tim",
            Form: (props) => 
                <TeamMember {...props}/>
        },
        {
            label: "Tambah Informasi Proyek",
            Form: (props) => 
                <ProjectInformation {...props}/>
        }
    ]

    return(
        <ProjectProvider>
            <div className="w-full md:mt-2">
                <MultiStepForm steps={steps}/>
            </div>
        </ProjectProvider>
    )
}