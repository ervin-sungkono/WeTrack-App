import { Field, type FieldProps, type FormikValues } from "formik"
import FormikErrorMessage from "./FormikErrorMessage";
import type { InputHTMLAttributes, ReactNode } from "react"

type FormikFieldIconProps = {
    icon: ReactNode
    name: string
    required?: boolean
    type: InputHTMLAttributes<HTMLInputElement>["type"]
    label: string
    placeholder?: string
    disabled?: boolean
}

/**
 * FormikFieldIcon Component
 */
export default function FormikFieldIcon({icon, name, required, type, label, placeholder, disabled }: FormikFieldIconProps){
    return(
        <Field name={name}>
            {(formikField: FieldProps<string, FormikValues>) => {
                return (
                    <div>
                        <div className="flex gap-3">
                            <div>
                                {icon}
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                                <label htmlFor={name} className="block font-semibold text-xs md:text-sm text-dark-blue">
                                    {label}
                                    {required && <span className="text-red-600">*</span>}
                                </label>
                            <div className="relative flex items-center">
                                <input
                                    {...formikField.field}
                                    type={type}
                                    id={name}
                                    placeholder={placeholder}
                                    disabled={disabled}
                                    className={
                                        `w-full px-2.5 md:px-4 py-1.5 md:py-2.5 rounded-md
                                        ${!disabled ? 'bg-transparent' : 'bg-light-blue'}
                                        ${formikField.meta.error && formikField.meta.touched ? "border-red-600" : "border-dark-blue/30"}
                                        text-sm`
                                    }
                                />
                            </div>
                            <FormikErrorMessage name={name}/>
                            </div>
                        </div>
                    </div>
                );
            }}
        </Field>
    )
}
