"use client"
import FormikWrapper from "../formik/FormikWrapper"
import { useEffect, useState } from "react"
import { useProjectData } from "@/app/lib/context/project"
import { projectInformationSchema } from "@/app/lib/schema"

import FormikField from "../formik/FormikField"
import FormikTextarea from "../formik/FormikTextarea"
import Button from "../../button/Button"
import SkeletonInputField from "@/app/components/skeleton/SkeletonInputField"
import SkeletonButton from "@/app/components/skeleton/SkeletonButton"
import KeyFormikField from "./KeyFormikField"
import SkeletonTextarea from "@/app/components/skeleton/SkeletonTextarea"

export default function ProjectInformation({prevFormStep}){
    const [isLoading, setLoading] = useState(true)
    const [completed, setCompleted] = useState(false)
    const { projectData, submitProjectData } = useProjectData()
    
    useEffect(() => setLoading(false), [])

    const initialValues = {
        projectName: projectData.projectName ?? "",
        key: projectData.key ?? "",
        userStory: ""
    }

    const onSubmit = (values) => {
        // console.log("step 2: ",values)
        submitProjectData(values)
            .then(res => {
                if(res.data){
                    setCompleted(true)
                    // TODO: Tambah logic untuk generate issue apabila template nya AI Generate
                    // TODO-2: Tambah logic untuk integrasi dengan API chatGPT
                }else{
                    console.log(res)
                    alert("Gagal mengirim data formulir")
                }
            })
            .catch(err => console.log(err))
    }

    if(completed){
        return(
            <div>
                Project Successfully created!
            </div>
        )
    }
    if(isLoading) return(
        <div className="flex flex-col gap-6">
            <div className="flex flex-col animate-pulse gap-4">
                <SkeletonInputField/>
                <SkeletonInputField/>
                {projectData.templateType === 'ai-generated' && <SkeletonTextarea rows={4}/>}
            </div>
            <div className="flex justify-end">
                <SkeletonButton/>
            </div>
        </div> 
    )
    return(
        <FormikWrapper
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={projectInformationSchema}
        >
            {(formik) => {
                return(
                    <div className="w-full flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <FormikField label="Nama Proyek" required name="projectName" type="text" placeholder={"Masukkan nama proyek.."}/>
                            <KeyFormikField/>
                            {projectData.templateType === 'ai-generated' && <FormikTextarea label="Cerita Pengguna" name="userStory" placeholder={"Masukkan cerita pengguna.."} rows={4}/>}
                        </div>
                        <div className="flex justify-end gap-2 md:gap-4">
                            <Button variant="secondary" onClick={prevFormStep} className="w-24 md:w-32">Kembali</Button>
                            <Button type={"submit"} className="w-24 md:w-32">Kirim</Button>
                        </div>
                    </div>
                ) 
            }}
        </FormikWrapper>
    )
}