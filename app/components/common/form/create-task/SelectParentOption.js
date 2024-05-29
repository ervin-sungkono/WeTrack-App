"use client"
import { useEffect, useState } from "react"
import FormikSelectField from "../formik/FormikSelectField"
import { useFormikContext } from "formik"
import { getAllTask } from "@/app/lib/fetch/task";

export default function SelectParentOption(){
    const [taskOptions, setTaskOptions] = useState([])
    const { values: { projectId, type }, setFieldValue } = useFormikContext()

    useEffect(() => {
        const fetchTaskOptions = async() => {
            if(!projectId) return
            const tasks = await getAllTask(projectId)
            if(tasks.data){
                setTaskOptions(tasks.data
                    .map(task => ({
                        label: task.taskName,
                        value: task.id
                    }))
                )
                if(tasks.data.length > 0) setFieldValue('parentId', tasks.data[0].id)
            }
        }
        if(type === "SubTask") fetchTaskOptions()
        else if(type === "Task") setFieldValue('parentId', null)
    }, [projectId, type])

    if(type !== 'SubTask') return null
    return(
        <FormikSelectField 
            label="Induk Tugas" 
            required 
            name="parentId" 
            placeholder={"-- Pilih Induk Tugas --"}
            defaultValue={taskOptions[0]}
            options={taskOptions}
            disabled={!projectId}
        />
    )
}