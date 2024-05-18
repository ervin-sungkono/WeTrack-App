import FormikField from "../formik/FormikField"

import { useCallback, useEffect } from "react"
import { useFormikContext } from "formik"
import { generateProjectKey } from "@/app/lib/string"
import { debounce } from "@/app/lib/helper"

export default function KeyFormikField({disabled}){
    const { 
        values: { projectName },
        setFieldValue
    } = useFormikContext()

    const updateKeyField = useCallback(
        debounce(
            projectName => {
                setFieldValue('key', generateProjectKey(projectName))
            }, 500),
        []
    )

    useEffect(() => {
        updateKeyField(projectName)
    }, [projectName, updateKeyField])

    return(
        <div className="flex flex-col gap-1">
            <FormikField label="Kunci Proyek" disabled={disabled} required name="key" type="text" placeholder={"Masukkan kunci.."}/>
            {!disabled && 
                <p className="text-xs text-dark-blue">Kunci proyek akan digunakan sebagai awalan untuk tugas proyek Anda, dapat dihasilkan secara otomatis.</p>
            }
        </div>
    )
}