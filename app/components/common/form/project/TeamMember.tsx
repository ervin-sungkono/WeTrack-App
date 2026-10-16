"use client"
import { useRef, useState } from "react"
import { useProjectData } from "@/app/lib/context/project"
import FormikWrapper from "../formik/FormikWrapper"
import Button from "../../button/Button"
import Tags from "@/app/lib/tagify"
import { useSession } from "next-auth/react"
import PopUpLoad from "../../alert/PopUpLoad"
import type { MultiStepProps } from "../MultiStepForm"
import type { TagifyChangeEvent } from "@/app/lib/tagify"

export default function TeamMember({ prevFormStep, nextFormStep }: MultiStepProps){
    const { projectData, setProjectData } = useProjectData()
    const [teams, setTeams] = useState(projectData.teams ?? "")
    const { data: session } = useSession()

    const tagifyRef = useRef<unknown>(null)
    const tagifySettings = {
        editTags: {
            keepInvalid: false,
        },
        blacklist: session ? [session.user.email] : [],
        backspace: 'edit',
        delimiters: " ",
        keepInvalidTags: true,
        pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        placeholder: "Ketik email anggota tim Anda, dipisahkan dengan spasi atau enter."
    }

    const handleTagifyChange = (e: TagifyChangeEvent) => {
        setTeams(e.detail.value)
    }

    const onSubmit = () => {
        setProjectData({ teams })
        nextFormStep()
    }

    if (!session) return <PopUpLoad />

    return(
        <FormikWrapper
            initialValues={{}}
            onSubmit={onSubmit}
        >
            {() => {
                return(
                    <div className="w-full flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label htmlFor={"teams"} className="block font-semibold text-xs md:text-sm">
                                    Undang Anggota Tim <span className="text-[10.8px] md:text-xs font-medium">(opsional)</span>
                                </label>
                <Tags
                                    name="teams"
                                    tagifyRef={tagifyRef}
                                    settings={tagifySettings}
                                    defaultValue={projectData.teams}
                                    autoFocus
                                    onChange={handleTagifyChange}
                                />
                                <p className="text-[10.8px] md:text-xs text-dark-blue/80">Undangan Anda hanya akan terkirim apabila email yang Anda masukkan terdaftar di WeTrack.</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 md:gap-4">
                            <Button variant="secondary" onClick={prevFormStep} className="w-24 md:w-32">Kembali</Button>
                            <Button type={"submit"} className="w-24 md:w-32">Berikutnya</Button>
                        </div>
                    </div>
                )
            }}
        </FormikWrapper>
    )
}
