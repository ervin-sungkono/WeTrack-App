"use client"
import type { FormikHelpers } from "formik"
import { deleteProfileSchema } from "@/app/lib/schema"
import { deleteUserProfile } from "@/app/lib/fetch/user"
import Button from "../../button/Button"
import FormikField from "../formik/FormikField"
import FormikWrapper from "../formik/FormikWrapper"
import { useState } from "react"
import PopUpLoad from "../../alert/PopUpLoad"
import type { DeleteAccountFormValues } from "@/app/lib/schema"
import type { PopUpMultiStepComponentProps } from "../../alert/PopUpMultiStepForm"

type DeleteAccountValidationFormProps = Pick<PopUpMultiStepComponentProps, "prevFormStep"> & { onConfirm: () => void }

export default function DeleteAccountValidationForm({prevFormStep, onConfirm}: DeleteAccountValidationFormProps){
    const [loading, setLoading] = useState(false)
    const initialValues = {
        confirmationPassword: ""
    }

    const onSubmit = async(values: DeleteAccountFormValues, { setFieldError }: FormikHelpers<DeleteAccountFormValues>) => {
        setLoading(true);
        try{
            const res = await deleteUserProfile({
                password: values.confirmationPassword
            })
            if(res.success){
                onConfirm()
            }
        }catch(error){
            if(error instanceof Error && error.message.includes("auth/invalid-credential")){
                setFieldError("confirmationPassword", "Kata sandi yang Anda masukkan tidak sesuai dengan kredensial Anda!")
            }else if(error instanceof Error && error.message.includes("auth/too-many-requests")){
                setFieldError("confirmationPassword", "Terlalu banyak percobaan yang gagal, coba lagi nanti!")
            }
        }finally{
            setLoading(false);
        }
    }

    return (
        <FormikWrapper
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={deleteProfileSchema}
        >
            {() => (
                <>
                    {loading && <PopUpLoad/>}
                    <div>
                        <FormikField
                            name="confirmationPassword"
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
        </FormikWrapper>
    )
}
