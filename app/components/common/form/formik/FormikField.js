import { Field } from "formik"
import FormikErrorMessage from "./FormikErrorMessage";
import { useState } from "react";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

/**
 * FormikField Component
 */
export default function FormikField({icon, name, required, type, label, placeholder, value, disabled }){
    const [checked, setChecked] = useState(false)
    const [fieldValue, setFieldValue] = useState(value)
    const togglePassword = () => {
        if(checked) setChecked(false)
        else setChecked(true)
    }
    return(
        <Field name={name}>
            {(formikField) => {
                return (
                    <div>
                        {icon ? (
                            <div className="flex gap-3">
                                <div>
                                    {icon}
                                </div>
                                <div className="flex flex-col gap-1 w-full">
                                    <label htmlFor={name} className="block font-semibold text-xs md:text-sm">
                                        {label}
                                        {required && <span className="text-red-600">*</span>}
                                    </label>
                                    <div className="relative flex items-center">
                                        <input
                                            {...formikField.field}
                                            defaultChecked={formikField.field.value}
                                            type={(checked && type === "password") ? "text" : type}
                                            id={name}
                                            placeholder={placeholder}
                                            value={fieldValue}
                                            onChange={(e) => {
                                                setFieldValue(e.target.value)
                                            }}
                                            disabled={disabled == false ? false : true}
                                            className={
                                                `w-full px-2.5 md:px-4 py-1.5 md:py-2.5 rounded-md
                                                ${disabled == false ? 'bg-transparent' : 'bg-light-blue'}
                                                ${formikField.meta.error && formikField.meta.touched ? "border-red-600" : "border-dark/30"}
                                                text-sm`
                                            }
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
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <label htmlFor={name} className="block font-semibold text-xs md:text-sm">
                                    {label}
                                    {required && <span className="text-red-600">*</span>}
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        {...formikField.field}
                                        defaultChecked={formikField.field.value}
                                        type={(checked && type === "password") ? "text" : type}
                                        id={name}
                                        placeholder={placeholder}
                                        value={fieldValue}
                                        onChange={(e) => {
                                            setFieldValue(e.target.value)
                                        }}
                                        className={`w-full px-2.5 md:px-4 py-1.5 md:py-2.5 rounded-md bg-transparent ${formikField.meta.error && formikField.meta.touched ? "border-red-600" : "border-dark/30"} text-sm`}
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
                        )}
                    </div>
                );
            }}
        </Field>
    )
}