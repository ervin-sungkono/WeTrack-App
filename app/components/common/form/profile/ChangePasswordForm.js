/* eslint-disable react/no-children-prop */
import { changePasswordSchema } from "@/app/lib/schema"
import PopUpForm from "../../alert/PopUpForm"
import FormikWrapper from "../formik/FormikWrapper"
import FormikField from "../formik/FormikField"
import Button from "../../button/Button"

export default function ChangePasswordForm({onConfirm, onClose}){
    const initialValues = {
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    }

    return (
        <PopUpForm
            variant="secondary"
            title={"Ganti Kata Sandi"}
            titleSize={"large"}
            message={"Pastikan konfirmasi kata sandi baru Anda sebelum dikirim."}
        >
            <FormikWrapper
                initialValues={initialValues}
                onSubmit={onConfirm}
                validationSchema={changePasswordSchema}
                children={(formik) => (
                    <>
                        <div className="flex flex-col gap-4">
                            <div>
                                <FormikField
                                    name="oldPassword"
                                    required
                                    type="password"
                                    label="Kata Sandi Lama"
                                    placeholder="Masukkan kata sandi lama..."
                                />
                            </div>
                            <div>
                                <FormikField
                                    name="newPassword"
                                    required
                                    type="password"
                                    label="Kata Sandi Baru"
                                    placeholder="Masukkan kata sandi baru..."
                                />
                            </div>
                            <div>
                                <FormikField
                                    name="confirmPassword"
                                    required
                                    type="password"
                                    label="Konfirmasi Kata Sandi Baru"
                                    placeholder="Masukkan konfirmasi kata sandi baru..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 md:gap-4 items-center justify-end mt-4 md:mt-8">
                            <Button size="sm" variant="primary" type="submit">Simpan Perubahan</Button>
                            <Button size="sm" variant="secondary" onClick={onClose}>Batal</Button>
                        </div>
                    </>
                )}
            />
        </PopUpForm>
    )
}