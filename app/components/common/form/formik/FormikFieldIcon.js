import { Field } from "formik"
import FormikErrorMessage from "./FormikErrorMessage";
import { useState } from "react";

/**
 * FormikFieldIcon Component
 */
export default function FormikFieldIcon({icon, name, required, type, label, placeholder, disabled }){
    return(
        <Field name={name}>
            {(formikField) => {
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
                                    defaultChecked={formikField.field.value}
                                    type={type}
                                    id={name}
                                    placeholder={placeholder}
                                    disabled={disabled}
                                    className={
                                        `w-full px-2.5 md:px-4 py-1.5 md:py-2.5 rounded-md
                                        ${!disabled ? 'bg-transparent' : 'bg-light-blue'}
                                        ${formikField.meta.error && formikField.meta.touched ? "border-red-600" : "border-dark/30"}
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