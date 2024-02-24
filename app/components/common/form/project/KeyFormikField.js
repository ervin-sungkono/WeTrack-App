import FormikField from "../formik/FormikField"

import { useCallback, useEffect } from "react"
import { useFormikContext } from "formik"
import { generateProjectKey } from "@/app/lib/string"
import { debounce } from "@/app/lib/helper"

export default function KeyFormikField(){
    const { 
        values: { projectName },
        setFieldValue
    } = useFormikContext()

    const updateKeyField = useCallback(
        debounce(
            projectName => {
                console.log(projectName)
                setFieldValue('key', generateProjectKey(projectName))
            }, 500),
        []
    )

    useEffect(() => {
        updateKeyField(projectName)
    }, [projectName, updateKeyField])

    return(
        <div className="flex flex-col gap-1">
            <FormikField label="Key" required name="key" type="text" placeholder={"Enter key.."}/>
            <p className="text-xs text-dark-blue">Key will be used as a prefix for your project&#x2019;s issues, can be auto-generated.</p>
        </div>
    )
}