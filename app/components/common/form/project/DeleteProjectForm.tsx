import { deleteProjectSchema } from "@/app/lib/schema"
import PopUpForm from "../../alert/PopUpForm"
import Button from "../../button/Button"
import FormikField from "../formik/FormikField"
import FormikWrapper from "../formik/FormikWrapper"
import type { FormikHelpers } from "formik"
import type { DeleteProjectFormValues } from "@/app/lib/schema"

type DeleteProjectFormProps = {
    onConfirm: (values: DeleteProjectFormValues, helpers: FormikHelpers<DeleteProjectFormValues>) => void | Promise<void>
    onClose: () => void
    projectName: string
}

export default function DeleteProjectForm({onConfirm, onClose, projectName}: DeleteProjectFormProps){
    const initialValues = {
        projectName: ""
    }

    return (
        <PopUpForm
            variant="secondary"
            title={"Hapus Proyek"}
            titleSize={"large"}
            message={
                <span>
                    Ketik nama proyek pada kolom di bawah untuk menghapus proyek: <b>{projectName}</b>
                </span>
            }
            wrapContent
        >
            <FormikWrapper
                initialValues={initialValues}
                onSubmit={onConfirm}
                validationSchema={deleteProjectSchema}
            >
                {() => (
                    <>
                        <div>
                            <FormikField
                                name="projectName"
                                required
                                type="text"
                                label="Nama Proyek"
                                placeholder="Masukkan nama proyek..."
                            />
                        </div>
                        <div className="mt-8 flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
                            <Button variant="danger" type="submit">Hapus</Button>
                            <Button variant="secondary" onClick={onClose}>Kembali</Button>
                        </div>
                    </>
                )}
            </FormikWrapper>
        </PopUpForm>
    )
}
