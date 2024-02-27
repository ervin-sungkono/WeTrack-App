import { Field } from "formik"
import FormikErrorMessage from "./FormikErrorMessage";
import { useState } from "react";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

/**
 * FormikField Component
 */
export default function FormikField({ name, required, type, label, placeholder }){
    const [checked, setChecked] = useState(false)
    const togglePassword = () => {
        if(checked) setChecked(false)
        else setChecked(true)
    }
    return(
        <Field name={name}>
            {(formikField) => {
                return (
                    <div className="flex flex-col gap-1">
                        <label htmlFor={name} className="block font-semibold text-xs md:text-sm">
                            {label}
                            {/* {required && <span className="text-red-600">*</span>} */}
                        </label>
                        <div className="relative flex items-center">
                            <input
                                {...formikField.field}
                                defaultChecked={formikField.field.value}
                                type={(checked && type === "password") ? "text" : type}
                                id={name}
                                placeholder={placeholder}
                                className={`w-full px-2 md:px-3 py-1.5 md:py-2 rounded-md bg-transparent ${formikField.meta.error && formikField.meta.touched ? "border-red-600" : "border-dark/30"} text-sm`}
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