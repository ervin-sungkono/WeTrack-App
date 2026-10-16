"use client"
import { useEffect, useState } from "react"
import FormikSelectField from "../formik/FormikSelectField"
import { useFormikContext } from "formik"
import { getAllTaskStatus } from "@/app/lib/fetch/taskStatus"
import type { CreateTaskFormValues, SelectOption } from "@/app/types/ui";

export default function SelectStatusOption(){
    const [statusOptions, setStatusOptions] = useState<SelectOption<string>[]>([])
    const { values: { projectId }, setFieldValue} = useFormikContext<CreateTaskFormValues>()

    useEffect(() => {
        let active = true
        const fetchStatusOptions = async() => {
            if(!projectId) {
                setStatusOptions([])
                return
            }
            const statusData = await getAllTaskStatus(projectId)
            if (!active) return
            if(statusData.data){
                const statusOptionsData = statusData.data.map(status => ({
                    label: status.status ?? status.statusName ?? "",
                    value: status.id
                }))
                setStatusOptions(statusOptionsData)
                if (statusData.data[0]) setFieldValue('statusId', statusData.data[0].id)
            } else {
                setStatusOptions([])
            }
        }
        void fetchStatusOptions()
        return () => { active = false }
    }, [projectId, setFieldValue])

    return(
        <div className="flex flex-col gap-1">
            <FormikSelectField
                label="Status"
                required
                name="statusId"
                options={statusOptions}
                disabled={!projectId}
            />
            <p className="text-xs text-dark-blue">Ini adalah status awal tugas setelah dibuat.</p>
        </div>
    )
}
