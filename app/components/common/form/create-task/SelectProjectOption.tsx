"use client"
import { useEffect, useState } from "react"
import FormikSelectField from "../formik/FormikSelectField"
import { useFormikContext } from "formik"
import { getAllProject } from "@/app/lib/fetch/project";
import type { CreateTaskFormValues, SelectOption } from "@/app/types/ui";

export default function SelectProjectOption(){
    const [projectOptions, setProjectOptions] = useState<SelectOption<string>[]>([])
    const [loaded, setLoaded] = useState(false)
    const { values: { projectId }, setFieldValue, setFieldError } = useFormikContext<CreateTaskFormValues>()

    useEffect(() => {
        const fetchProjectOptions = async() => {
            const projects = await getAllProject()
            if(projects.data){
                const options = projects.data
                    .filter(project => project.projectRole !== 'Viewer')
                    .map(project => ({
                        label: project.projectName,
                        value: project.id
                    }))
                setProjectOptions(options)
                if(options.length > 0) setFieldValue('projectId', options[0].value)
                else setFieldError('projectId', 'Anda harus memiliki setidaknya satu proyek untuk membuat tugas baru!')
            }
            else setFieldError('projectId', 'Gagal menemukan proyek')
            setLoaded(true)
        }
        if(!projectId && !loaded) void fetchProjectOptions()
    }, [projectId, loaded, setFieldError, setFieldValue])

    return(
        <FormikSelectField
            label="Proyek"
            required
            name="projectId"
            options={projectOptions}
        />
    )
}
