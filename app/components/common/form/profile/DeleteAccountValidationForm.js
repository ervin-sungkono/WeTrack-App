/* eslint-disable react/no-children-prop */
import { deleteProfileSchema } from "@/app/lib/schema"
import PopUpForm from "../../alert/PopUpForm"
import Button from "../../button/Button"
import FormikField from "../formik/FormikField"
import FormikWrapper from "../formik/FormikWrapper"

export default function DeleteAccountValidationForm({prevFormStep, onConfirm}){
    const initialValues = {
        password: ""
    }
    
    return (
        <PopUpForm
            title={"Validasi Penghapusan Akun"}
            titleSize={"large"}
            message={"Masukkan kata sandi yang Anda gunakan dalam akun ini."}
            wrapContent
        >
            <FormikWrapper
                initialValues={initialValues}
                onSubmit={(values, { setFieldError }) => {
                    onConfirm(values, setFieldError)
                }}
                validationSchema={deleteProfileSchema}
                children={(formik) => (
                    <>
                        <div>
                            <FormikField
                                name="password"
                                required
                                type="password"
                                label="Kata Sandi"
                                placeholder="Masukkan kata sandi..."
                            />
                        </div>
                        <div className="mt-8 flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
                            <Button variant="danger" type="submit">Hapus</Button>
                            <Button variant="secondary" onClick={prevFormStep}>Kembali</Button>
                        </div>
                    </>
                )}
            />
        </PopUpForm>
    )
}