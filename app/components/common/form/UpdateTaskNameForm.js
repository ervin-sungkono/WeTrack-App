import PopUpForm from "../alert/PopUpForm"
import FormikWrapper from "./formik/FormikWrapper"
import FormikField from "./formik/FormikField"
import Button from "../button/Button"
import { updateTaskNameSchema } from "@/app/lib/schema"

export default function UpdateTaskNameForm({ taskName, onClose, onSubmit }){
    const initialValues = {
        taskName: taskName
    }

    return(
        <PopUpForm 
            title={`Ubah Nama Tugas`}
            message={"Masukkan nama tugas baru"}
            wrapContent
        >
            <FormikWrapper
                initialValues={initialValues}
                onSubmit={onSubmit}
                validationSchema={updateTaskNameSchema}
            >
                {(formik) => (
                    <>
                        <div className="flex flex-col">
                            <FormikField 
                                name="taskName"
                                type={"text"}
                                label="Nama Tugas" 
                                placeholder={"Masukkan nama tugas..."}
                            />
                        </div>
                        <div className="flex gap-2 md:gap-4 items-center justify-end mt-4 md:mt-8">
                            <Button variant="secondary" onClick={onClose}>Batal</Button>
                            <Button variant="primary" onClick={(e) => {
                                e.stopPropagation()
                                formik.submitForm()
                            }}>Ubah</Button>
                        </div>
                    </>
                )}
            </FormikWrapper>
        </PopUpForm>
    )
}