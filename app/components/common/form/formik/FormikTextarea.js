import { Field } from "formik"
import FormikErrorMessage from "./FormikErrorMessage"

/**
 * FormikTextarea Component
 */
export default function FormikTextarea({ name, max = null, required, label, placeholder, rows = 4, resize = true }){
    return(
        <Field name={name}>
            {(formikField) => {
                return (
                    <div className="flex flex-col gap-1">
                        <label htmlFor={name} className="block font-semibold text-xs md:text-sm text-dark-blue">
                            {label}
                            {required && <span className="text-red-600">*</span>}
                        </label>
                        <textarea
                            {...formikField.field}
                            maxLength={max}
                            name={name}
                            placeholder={placeholder}
                            rows={rows}
                            className={
                                `bg-transparent text-xs md:text-sm rounded-lg focus:ring-normal-green block w-full px-2.5 md:px-4 py-1.5 md:py-2.5
                                ${formikField.meta.error && formikField.meta.touched ? "border-red-600" : "border-dark-blue/30"} 
                                ${resize ? "" : "resize-none"}` 
                            }
                        />
                        <div className="flex items-start gap-1.5">
                            <FormikErrorMessage name={name}/>
                            <div className={`flex ml-auto items-center gap-1 text-xs ${formikField.meta.error ? "text-red-600" : "text-dark-blue/80"}`}>
                                <p>{formikField.field.value?.trim().length ?? 0}</p>
                                <p>/</p>
                                <p>{max}</p>
                            </div>
                        </div>
                    </div>
                );
            }}
        </Field>
    )
}