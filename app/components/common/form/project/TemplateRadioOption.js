import { Field } from "formik"
import FormikErrorMessage from "../formik/FormikErrorMessage"

export default function TemplateRadioOption({ name }){
    function RadioButton({ title, description, value, field }){
        return(
            <label>
                <input
                    {...field}
                    type="radio" 
                    id={value}
                    value={value}
                    checked={field.value === value}
                    className="hidden peer"
                />
                <div className="h-full flex flex-col gap-1 px-2 py-3 border check peer-checked:border-basic-blue border-dark-blue/30 rounded-md cursor-pointer transition-colors">
                    <div className="text-sm md:text-base font-semibold">{title}</div>
                    <p className="text-xs md:text-sm text-dark-blue/80">{description}</p>
                </div>
            </label>
        )
    }

    return(
        <Field name={name}>
            {({ field }) => {
                return(
                    <div className="flex flex-col gap-2">
                        <div role="group" className="grid grid-cols-1 xs:grid-cols-2 gap-2 md:gap-4">
                            <RadioButton 
                                title={"Default"}
                                description={"Templat bawaan untuk proyek"}
                                value={"default"}
                                field={field}
                            />
                            <RadioButton 
                                title={"AI Generated"}
                                description={"Hasilkan tugas untuk proyek Anda dengan AI sesuai deskripsi yang diberikan"}
                                value={"ai-generated"}
                                field={field}
                            />
                        </div>
                        <FormikErrorMessage name={name}/>
                    </div>
                )
            }}
        </Field>
    )
}