import PopUpForm from "../alert/PopUpForm"
import FormikWrapper from "./formik/FormikWrapper"
import FormikField from "./formik/FormikField"
import Button from "../button/Button"
import { updateStatusSchema } from "@/app/lib/schema"
import type { UpdateStatusFormValues } from "@/app/lib/schema"

type UpdateStatusFormProps = {
    id: string
    status: string
    onClose: () => void
    onSubmit: (values: UpdateStatusFormValues) => void | Promise<void>
}

export default function UpdateStatusForm({ status, onClose, onSubmit }: UpdateStatusFormProps){
    const initialValues = {
        statusName: status
    }

    return(
        <PopUpForm
            title={`Ubah nama status tugas ${status.toUpperCase()}`}
            message={"Masukkan nama status tugas baru"}
            wrapContent
        >
            <FormikWrapper
                initialValues={initialValues}
                onSubmit={onSubmit}
                validationSchema={updateStatusSchema}
            >
                {() => (
                    <>
                        <div className="flex flex-col">
                            <FormikField
                                name="statusName"
                                type={"text"}
                                label="Status Tugas"
                                placeholder={"Masukkan nama status..."}
                            />
                        </div>
                        <div className="flex gap-2 md:gap-4 items-center justify-end mt-4 md:mt-8">
                            <Button variant="secondary" onClick={onClose}>Batal</Button>
                            <Button variant="primary" type="submit">Ubah</Button>
                        </div>
                    </>
                )}
            </FormikWrapper>
        </PopUpForm>
    )
}
