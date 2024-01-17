import { Field } from "formik"
import FormikErrorMessage from "./FormikErrorMessage";

/**
 * FormikSelectField Component
 */
export default function FormikSelectField({ name, required, options, label, placeholder }){
    return(
        <Field name={name}>
            {(formikField) => {
                return (
                    <div className="flex flex-col gap-2">
                        <label htmlFor={name} className="block font-semibold text-sm md:text-base">
                            {label}{required && <span className="text-red-600">*</span>}
                        </label>
                        <select 
                            {...formikField.field}
                            id={name}
                            defaultValue={""}
                            className={`px-4 py-2.5 rounded-md ${formikField.meta.error && formikField.meta.touched ? "border-red-600" : "border-dark/30"} text-sm md:text-base`}
                        >
                            <option value={""} disabled>{placeholder}</option>
                            {options.map(({ label, value }) => (
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