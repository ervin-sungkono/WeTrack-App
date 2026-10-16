import FormikField from "../formik/FormikField"

import { useEffect, useMemo } from "react"
import { useFormikContext } from "formik"
import { generateProjectKey } from "@/app/lib/string"
import { debounce } from "@/app/lib/helper"

type KeyFormikFieldProps = { disabled?: boolean; settingMode?: boolean }

export default function KeyFormikField({disabled}: KeyFormikFieldProps){
    const {
        values: { projectName },
        setFieldValue
    } = useFormikContext<{ projectName: string; key: string }>()

    const updateKeyField = useMemo(() => debounce((name: string) => {
        setFieldValue('key', generateProjectKey(name))
    }, 500), [setFieldValue])

    useEffect(() => {
        updateKeyField(projectName)
    }, [projectName, updateKeyField])

    return(
        <div className="flex flex-col gap-1">
            <FormikField label="Kunci Proyek" disabled={disabled} required name="key" type="text" placeholder={"Masukkan kunci..."}/>
            {!disabled &&
                <p className="text-xs text-dark-blue">Kunci proyek akan digunakan sebagai awalan untuk tugas proyek Anda, dapat dihasilkan secara otomatis.</p>
            }
        </div>
    )
}
