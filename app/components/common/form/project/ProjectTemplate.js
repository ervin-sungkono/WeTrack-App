"use client"
import FormikWrapper from "../formik/FormikWrapper"
import { useProjectData } from "@/app/lib/context/project"
import { projectTemplateSchema } from "@/app/lib/schema"

import Button from "../../button/Button"
import TemplateRadioOption from "./TemplateRadioOption"

export default function ProjectTemplate({nextFormStep}){
    const { projectData, setProjectData } = useProjectData()

    const initialValues = {
        templateType: projectData.templateType ?? "",
    }

    const onSubmit = (values) => {
        // console.log("step 1: ",values)
        setProjectData(values)
        nextFormStep()
    }

    return(
        <FormikWrapper
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={projectTemplateSchema}
        >
            {(formik) => {
                return(
                    <div className="w-full flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <div className="text-base md:text-xl font-semibold">Pilih Template Proyek</div>
                            <TemplateRadioOption name="templateType"/>
                        </div>
                        <div className="flex justify-end">
                            <Button type={"submit"} className="w-32">Berikutnya</Button>
                        </div>
                    </div>
                ) 
            }}
        </FormikWrapper>
    )
}