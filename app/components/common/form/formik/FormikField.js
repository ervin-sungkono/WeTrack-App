import { Field } from "formik"
import FormikErrorMessage from "./FormikErrorMessage";
import { useState } from "react";

/**
 * FormikField Component
 */
export default function FormikField({ name, required, type, label, placeholder }){
    const [checked, setChecked] = useState(false)
    return(
        <Field name={name}>
            {(formikField) => {
                return (
                    <div className="flex flex-col gap-1">
                        <label htmlFor={name} className="block font-semibold text-sm">
                            {label}
                            {/* {required && <span className="text-red-600">*</span>} */}
                        </label>
                        <input
                            {...formikField.field}
                            defaultChecked={formikField.field.value}
                            type={(checked && type === "password") ? "text" : type}
                            id={name}
                            placeholder={placeholder}
                            className={`px-3 py-2 rounded-md ${formikField.meta.error && formikField.meta.touched ? "border-red-600" : "border-dark/30"} text-sm`}
                        />
                        <FormikErrorMessage name={name}/>
                        {/* {type === "password" &&
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id={`show${name}`} className="border border-dark/50 rounded-sm focus:ring-0" onChange={(e) => setChecked(e.target.checked)}/>
                                <label htmlFor={`show${name}`} className="text-xs select-none">Show Password</label>
                            </div>
                        } */}
                    </div>
                );
            }}
        </Field>
    )
}