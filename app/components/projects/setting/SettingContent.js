"use client"

import { ProjectProvider } from "@/app/lib/context/project"
import SettingForm from "../../common/form/project/SettingForm"

export default function SettingContent(){

    return (
        <ProjectProvider>
            <SettingForm />  
        </ProjectProvider>
    )
}