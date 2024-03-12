import { Field } from "formik"
import FormikErrorMessage from "./FormikErrorMessage";

/**
 * FormikCheckbox Component
 */
export default function FormikCheckbox({ name, label, placeholder }){
    return(
        <Field name={name}>
            {(formikField) => {
                return (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <input
                                {...formikField.field}
                                defaultChecked={formikField.field.value}
                                type="checkbox"
                                id={name}
                                placeholder={placeholder}
                                className={`w-5 h-5 rounded`}
                            />
                            <label htmlFor={name} className="block text-xs md:text-sm text-dark-blue">
                                {label}
                            </label>
                        </div>
                        
                        <FormikErrorMessage name={name}/>
                    </div>
                );
            }}
        </Field>
    )
}