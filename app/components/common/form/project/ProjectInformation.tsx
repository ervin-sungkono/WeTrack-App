"use client"
import FormikWrapper from "../formik/FormikWrapper"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useProjectData } from "@/app/lib/context/project"
import { projectInformationSchema } from "@/app/lib/schema"
import { generateTask } from "@/app/lib/fetch/project"
import { createNewTask } from "@/app/lib/fetch/task"

import FormikField from "../formik/FormikField"
import FormikTextarea from "../formik/FormikTextarea"
import Button from "../../button/Button"
import KeyFormikField from "./KeyFormikField"
import PopUpLoad from "../../alert/PopUpLoad"
import PopUpInfo from "../../alert/PopUpInfo"
import type { MultiStepProps } from "../MultiStepForm"

type ProjectInformationValues = {
    projectName: string
    key: string
    projectDescription: string
}

export default function ProjectInformation({prevFormStep}: Pick<MultiStepProps, "prevFormStep">){
    const [completed, setCompleted] = useState(false)
    const [projectId, setProjectId] = useState<string | null>(null)
    const [isSubmittingProject, setSubmitProject] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const { projectData, submitProjectData } = useProjectData()

    const initialValues = {
        projectName: projectData.projectName ?? "",
        key: projectData.key ?? "",
        projectDescription: ""
    }

    const onSubmit = async(values: ProjectInformationValues) => {
        setSubmitProject(true)
        try{
            if(projectData.templateType === 'ai-generated'){
                const taskList = await generateTask({ projectDescription: values.projectDescription })
                if(!taskList.success || !taskList.data){
                    setErrorMessage(taskList.message ?? "Gagal menghasilkan tugas dari deskripsi proyek.")
                    return
                }

                const res = await submitProjectData(values)
                if(res.success && res.data){
                    const project = res.data
                    setCompleted(true)
                    setProjectId(project.id)
                    const statusId = project.startStatus
                    if (!statusId) throw new Error("Status awal proyek tidak tersedia.")
                    await Promise.all(taskList.data.map((task) => {
                        return createNewTask({
                            ...task,
                            projectId: project.id,
                            statusId
                        })
                    }))
                }else{
                    setErrorMessage(res.message ?? "Gagal mengirim data formulir")
                }
            }
            else if(projectData.templateType === 'default'){
                const res = await submitProjectData(values)

                if(res.success && res.data){
                    setCompleted(true)
                    setProjectId(res.data.id)
                }else{
                    setErrorMessage(res.message ?? "Gagal mengirim data formulir")
                }
            }
        }catch(error){
            setErrorMessage(error instanceof Error ? error.message : "Gagal mengirim data formulir")
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
    return(
        <>
            {isSubmittingProject && <PopUpLoad/>}
            {errorMessage &&
            <PopUpInfo
                title={"Gagal Membuat Proyek"}
                message={errorMessage}
            >
                <div className="flex justify-end gap-2 md:gap-4">
                    <Button onClick={() => setErrorMessage(null)} className="w-24 md:w-32">OK</Button>
                </div>
            </PopUpInfo>}
            <FormikWrapper
                initialValues={initialValues}
                onSubmit={onSubmit}
                validationSchema={projectInformationSchema}
            >
                {(formik) => {
                    return(
                        <div className="w-full flex flex-col gap-6">
                            <div className="flex flex-col gap-4">
                                <FormikField label="Nama Proyek" required name="projectName" type="text" placeholder={"Masukkan nama proyek..."}/>
                                <KeyFormikField settingMode={true}/>
                                {projectData.templateType === 'ai-generated' && <FormikTextarea label="Deskripsi Proyek (minimal 30 karakter)" required name="projectDescription" placeholder={"Masukkan deskripsi proyek, contoh: Saya ingin membuat aplikasi belajar hitung dasar"} rows={4}/>}
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
