"use client"
import { useEffect, useState } from "react"
import FormikSelectField from "../formik/FormikSelectField"
import { useFormikContext } from "formik"
import { getAllTask } from "@/app/lib/fetch/task";
import type { CreateTaskFormValues, SelectOption } from "@/app/types/ui";

export default function SelectParentOption(){
    const [taskOptions, setTaskOptions] = useState<SelectOption<string>[]>([])
    const { values: { projectId, type }, setFieldValue } = useFormikContext<CreateTaskFormValues>()

    useEffect(() => {
        let active = true
        const fetchTaskOptions = async() => {
            if(!projectId) {
                if (active) setTaskOptions([])
                return
            }
            const tasks = await getAllTask(projectId)
            if (!active) return
            if(tasks.data){
                const options = tasks.data
                    .map(task => ({
                        label: task.taskName,
                        value: task.id
                    }))
                setTaskOptions(options)
                if(options.length > 0) setFieldValue('parentId', options[0].value)
            } else {
                setTaskOptions([])
            }
        }
        if(type === "SubTask") void fetchTaskOptions()
        else if(type === "Task") void setFieldValue('parentId', null)
        return () => { active = false }
    }, [projectId, setFieldValue, type])

    if(type !== 'SubTask') return null
    return(
        <FormikSelectField
            label="Induk Tugas"
            required
            name="parentId"
            placeholder={"-- Pilih Induk Tugas --"}
            options={taskOptions}
            disabled={!projectId}
        />
    )
}
