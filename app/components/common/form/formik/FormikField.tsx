import { Field, type FieldProps, type FormikValues } from "formik"
import FormikErrorMessage from "./FormikErrorMessage";
import { useState } from "react";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import type { InputHTMLAttributes } from "react"

type FormikFieldProps = {
    name: string
    required?: boolean
    type: InputHTMLAttributes<HTMLInputElement>["type"]
    label: string
    placeholder?: string
    disabled?: boolean
}

/**
 * FormikField Component
 */
export default function FormikField({ name, required, type, label, placeholder, disabled }: FormikFieldProps){
    const [checked, setChecked] = useState(false)

    const togglePassword = () => {
        if(checked) setChecked(false)
        else setChecked(true)
    }
    return(
        <Field name={name}>
            {(formikField: FieldProps<string | number, FormikValues>) => {
                return (
                    <div className="w-full flex flex-col gap-1">
                        <label htmlFor={name} className="block font-semibold text-xs md:text-sm text-dark-blue">
                            {label}
                            {required && !disabled && <span className="text-red-600">*</span>}
                        </label>
                        <div className="relative flex items-center">
                            <input
                                {...formikField.field}
                                type={(checked && type === "password") ? "text" : type}
                                id={name}
                                placeholder={placeholder}
                                disabled={disabled}
                                onClick={(e) => e.stopPropagation()}
                                className={`w-full px-2.5 md:px-4 py-1.5 md:py-2.5 rounded-md bg-transparent ${formikField.meta.error && formikField.meta.touched ? "border-red-600" : "border-dark-blue/30"} text-sm`}
                            />
                            {type === "password" && (
                                <>
                                    <FaEye onClick={togglePassword} className={`${checked ? "hidden" : "block"} absolute flex end-3 text-basic-blue cursor-pointer`} />
                                    <FaEyeSlash onClick={togglePassword} className={`${checked ? "block" : "hidden"} absolute flex end-3 text-basic-blue cursor-pointer`} />
                                </>
                            )}
                        </div>
                        <FormikErrorMessage name={name}/>
                    </div>
                );
            }}
        </Field>
    )
}
