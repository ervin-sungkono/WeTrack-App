"use client"
import { useEffect, useState } from "react"
import FormikSelectField from "../formik/FormikSelectField"
import { useFormikContext } from "formik"
import { getAllTaskStatus } from "@/app/lib/fetch/taskStatus"

export default function SelectStatusOption(){
    const [statusOptions, setStatusOptions] = useState([])
    const { values: { projectId }, setFieldValue} = useFormikContext()

    useEffect(() => {
        const fetchStatusOptions = async() => {
            if(!projectId) return
            const statusData = await getAllTaskStatus(projectId)
            if(statusData.data){
                const statusOptionsData = statusData.data.map(status => ({
                    label: status.status,
                    value: status.id
                }))
                setStatusOptions(statusOptionsData)
                setFieldValue('statusId', statusData.data[0].id)
            }
        }
        fetchStatusOptions()
    }, [projectId])

    return(
        <div className="flex flex-col gap-1">
            <FormikSelectField 
                label="Status" 
                required 
                name="statusId"
                options={statusOptions}
            />
            <p className="text-xs text-dark-blue">Ini adalah status awal tugas setelah dibuat.</p>
        </div>
    )
}