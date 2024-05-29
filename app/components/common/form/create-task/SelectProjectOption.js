"use client"
import { useEffect, useState } from "react"
import FormikSelectField from "../formik/FormikSelectField"
import { useFormikContext } from "formik"
import { getAllProject } from "@/app/lib/fetch/project";

export default function SelectProjectOption(){
    const [projectOptions, setProjectOptions] = useState(null)
    const { values: { projectId }, setFieldValue, setFieldError } = useFormikContext()

    useEffect(() => {
        const fetchProjectOptions = async() => {
            const projects = await getAllProject()
            if(projects.data){
                setProjectOptions(projects.data
                    .filter(project => project.role !== 'Viewer')
                    .map(project => ({
                        label: project.projectName,
                        value: project.id
                    }))
                )
                if(projects.data.length > 0) setFieldValue('projectId', projects.data[0].id)
            }
            else setFieldError('Gagal menemukan proyek')
        }
        if(!projectId && !projectOptions) fetchProjectOptions()
    }, [projectId, projectOptions])

    return(
        <FormikSelectField 
            label="Proyek" 
            required 
            name="projectId" 
            options={projectOptions}
        />
    )
}