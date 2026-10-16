"use client"
import MultiStepForm, { type MultiStep } from "@/app/components/common/form/MultiStepForm"
import ProjectTemplate from "@/app/components/common/form/project/ProjectTemplate"
import ProjectInformation from "@/app/components/common/form/project/ProjectInformation"
import TeamMember from "../common/form/project/TeamMember"
import { ProjectProvider } from "@/app/lib/context/project"

export default function CreateProjectContent(){
    const steps: MultiStep[] = [
        {
            label: "Pilih Template Proyek",
            Form: ProjectTemplate,
        },
        {
            label: "Undang Anggota Tim",
            Form: TeamMember,
        },
        {
            label: "Tambah Informasi Proyek",
            Form: ProjectInformation,
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
