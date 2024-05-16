"use client"
import FormikWrapper from "../formik/FormikWrapper"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useProjectData } from "@/app/lib/context/project"
import { projectInformationSchema } from "@/app/lib/schema"
import { generateTask } from "@/app/lib/fetch/project"
import { createNewTask } from "@/app/lib/fetch/task"

import FormikField from "../formik/FormikField"
import FormikTextarea from "../formik/FormikTextarea"
import Button from "../../button/Button"
import SkeletonInputField from "@/app/components/skeleton/SkeletonInputField"
import SkeletonButton from "@/app/components/skeleton/SkeletonButton"
import KeyFormikField from "./KeyFormikField"
import SkeletonTextarea from "@/app/components/skeleton/SkeletonTextarea"
import PopUpLoad from "../../alert/PopUpLoad"

export default function ProjectInformation({prevFormStep}){
    const [isLoading, setLoading] = useState(true)
    const [completed, setCompleted] = useState(false)
    const [projectId, setProjectId] = useState(null)
    const [isSubmittingProject, setSubmitProject] = useState(false)
    const { projectData, submitProjectData } = useProjectData()
    
    useEffect(() => setLoading(false), [])

    const initialValues = {
        projectName: projectData.projectName ?? "",
        key: projectData.key ?? "",
        projectDescription: ""
    }

    const onSubmit = async(values, { setSubmitting }) => {
        setSubmitProject(true)
        try{
            if(projectData.templateType === 'ai-generated'){
                if(values.projectDescription.length < 30){
                    alert("Deskripsi Proyek harus terdiri dari minimal 30 karakter.")
                    setSubmitProject(false)
                    return
                }
                const taskList = await generateTask(values)
                if(!taskList.success){
                    alert(taskList.message)
                    return
                }
    
                const res = await submitProjectData(values)
                    
                if(res.data){
                    setCompleted(true)
                    setProjectId(res.data.id)
                    await Promise.all(taskList.data.map((task) => {
                        return createNewTask({ 
                            ...task, 
                            projectId: res.data.id, 
                            statusId: res.data.startStatus 
                        })
                    }))
                }else{
                    console.log(res)
                    alert("Gagal mengirim data formulir")
                }
            }
            else if(projectData.templateType === 'default'){
                const res = await submitProjectData(values)

                if(res.data){
                    setCompleted(true)
                    setProjectId(res.data.id)
                }else{
                    console.log(res)
                    alert("Gagal mengirim data formulir")
                }
                
            }
            setSubmitProject(false)
        }catch(e){
            console.log(e)
        }
        finally{
            setSubmitProject(false)
        }
    }

    if(completed){
        return(
            <div className="w-full py-12 flex flex-col justify-center items-center gap-4">
                <Image
                    width={280}
                    height={280}
                    src={"/images/CompletedState.svg"}
                    alt="completed"
                />
                <p className="text-dark-blue/80 text-sm md:text-base text-center font-semibold">
                    Proyek berhasil dibuat!{' '}
                    <span>
                        <Link href={projectId ? `/projects/${projectId}` : "#"} className="text-basic-blue hover:underline">Klik di sini</Link>
                    </span> untuk melihat proyek tersebut.
                </p>
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
        <>
            {isSubmittingProject && <PopUpLoad/>}
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
                                <KeyFormikField settingMode={true}/>
                                {projectData.templateType === 'ai-generated' && <FormikTextarea label="Deskripsi Proyek" name="projectDescription" placeholder={"Masukkan deskripsi proyek.."} rows={4}/>}
                            </div>
                            <div className="flex justify-end gap-2 md:gap-4">
                                <Button variant="secondary" onClick={prevFormStep} className="w-24 md:w-32">Kembali</Button>
                                <Button type={"submit"} disabled={formik.isSubmitting} className="w-24 md:w-32">Kirim</Button>
                            </div>
                        </div>
                    ) 
                }}
            </FormikWrapper>
        </>
    )
}