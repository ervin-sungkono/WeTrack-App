"use client"
import { useRef, useState } from "react"
import { useProjectData } from "@/app/lib/context/project"
import FormikWrapper from "../formik/FormikWrapper"
import Button from "../../button/Button"
import Tags from "@/app/lib/tagify"

export default function TeamMember({ prevFormStep, nextFormStep }){
    const { projectData, setProjectData } = useProjectData()
    const [teams, setTeams] = useState()

    const tagifyRef = useRef()
    const tagifySettings = {
        editTags: {
            keepInvalid: false,
        },
        backspace: 'edit',
        delimiters: " ",
        keepInvalidTags: true,
        pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        placeholder: "Type your team member's email, separated by space or enter"
    }

    const handleTagifyChange = (e) => {
        setTeams(e.detail.value)
    }

    const onSubmit = () => {
        setProjectData({ teams })
        nextFormStep()
    }

    return(
        <FormikWrapper
            initialValues={{}}
            onSubmit={onSubmit}
        >
            {(formik) => {
                return(
                    <div className="w-full flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label htmlFor={"teams"} className="block font-semibold text-xs md:text-sm">
                                    Invite Team Member <span className="text-[10px] md:text-xs font-medium">(optional)</span>
                                </label>
                                <Tags
                                    name="teams"
                                    tagifyRef={tagifyRef}
                                    settings={tagifySettings}
                                    defaultValue={projectData.teams}
                                    autoFocus={true}
                                    onChange={handleTagifyChange}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 md:gap-4">
                            <Button variant="secondary" onClick={prevFormStep} className="w-24 md:w-32">Back</Button>
                            <Button type={"submit"} className="w-24 md:w-32">Next</Button>
                        </div>
                    </div>
                ) 
            }}
        </FormikWrapper>
    )
}