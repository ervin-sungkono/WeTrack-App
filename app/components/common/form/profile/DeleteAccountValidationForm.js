/* eslint-disable react/no-children-prop */
import { deleteProfileSchema } from "@/app/lib/schema"
import PopUpForm from "../../alert/PopUpForm"
import Button from "../../button/Button"
import FormikField from "../formik/FormikField"
import FormikWrapper from "../formik/FormikWrapper"

export default function DeleteAccountValidationForm({prevFormStep, onConfirm, error, errorMessage}){
    const initialValues = {
        email: ""
    }
    
    return (
        <PopUpForm
            title={"Validasi Penghapusan Akun"}
            titleSize={"large"}
            message={"Masukkan email yang Anda gunakan untuk membuat akun ini."}
        >
            <FormikWrapper
                initialValues={initialValues}
                onSubmit={onConfirm}
                validationSchema={deleteProfileSchema}
                children={(formik) => (
                    <>
                        <div>
                            <FormikField
                                name="email"
                                required
                                type="email"
                                label="Email"
                                placeholder="Masukkan email..."
                            />
                        </div>
                        {error && (<p className="mt-1 mb-2 text-xs text-left text-[#FF0000]">{errorMessage}</p>)}
                        <div className="mt-8 flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
                            <Button variant="secondary" onClick={prevFormStep}>Kembali</Button>
                            <Button variant="danger" type="submit">Hapus</Button>
                        </div>
                    </>
                )}
            />
        </PopUpForm>
    )
}