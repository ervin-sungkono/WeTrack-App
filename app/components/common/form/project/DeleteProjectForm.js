/* eslint-disable react/no-children-prop */
import { deleteProjectSchema } from "@/app/lib/schema"
import PopUpForm from "../../alert/PopUpForm"
import Button from "../../button/Button"
import FormikField from "../formik/FormikField"
import FormikWrapper from "../formik/FormikWrapper"

export default function DeleteProjectForm({onConfirm, onClose, projectName}){
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
                onSubmit={(values, { setFieldError }) => {
                    onConfirm(values, setFieldError)
                }}
                validationSchema={deleteProjectSchema}
                children={(formik) => (
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
            />
        </PopUpForm>
    )
}