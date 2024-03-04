

import { Field } from "formik"
import FormikErrorMessage from "./FormikErrorMessage"

/**
 * FormikTextarea Component
 */
export default function FormikTextarea({ name, required, label, placeholder, rows = 4 }){
    return(
        <Field name={name}>
            {(formikField) => {
                return (
                    <div className="flex flex-col gap-1">
                        <label htmlFor={name} className="block font-semibold text-xs md:text-sm">
                            {label}
                            {required && <span className="text-red-600">*</span>}
                        </label>
                        <textarea
                            {...formikField.field}
                            name={name}
                            placeholder={placeholder}
                            rows={rows}
                            className={
                                `bg-transparent text-sm rounded-lg focus:ring-normal-green block w-full px-2 md:px-3 py-1.5 md:py-2
                                ${formikField.meta.error && formikField.meta.touched ? "border-red-600" : "border-dark-blue/30"}`
                            }
                        />
                        <FormikErrorMessage name={name}/>
                    </div>
                );
            }}
        </Field>
    )
}