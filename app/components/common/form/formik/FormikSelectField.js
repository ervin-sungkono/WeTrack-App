import { Field } from "formik"
import FormikErrorMessage from "./FormikErrorMessage";

/**
 * FormikSelectField Component
 */
export default function FormikSelectField({ name, required, options, label, placeholder, defaultValue }){
    return(
        <Field name={name}>
            {(formikField) => {
                return (
                    <div className="w-full flex flex-col gap-2">
                        <label htmlFor={name} className="block font-semibold text-xs md:text-sm text-dark-blue">
                            {label}{required && <span className="text-red-600">*</span>}
                        </label>
                        <select 
                            {...formikField.field}
                            id={name}
                            defaultValue={defaultValue}
                            className={`px-2.5 md:px-4 py-1.5 md:py-2.5 rounded-md bg-transparent ${formikField.meta.error && formikField.meta.touched ? "border-red-600" : "border-dark-blue/30"} text-sm`}
                        >
                            <option value={""} disabled selected>{placeholder}</option>
                            {options?.map(({ label, value }) => (
                                <option value={value} key={value}>{label}</option>
                            ))}
                        </select>
                        <FormikErrorMessage name={name}/>
                    </div>
                );
            }}
        </Field>
    )
}