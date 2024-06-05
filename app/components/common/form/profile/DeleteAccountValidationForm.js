"use client"
/* eslint-disable react/no-children-prop */
import { deleteProfileSchema } from "@/app/lib/schema"
import { deleteUserProfile } from "@/app/lib/fetch/user"
import Button from "../../button/Button"
import FormikField from "../formik/FormikField"
import FormikWrapper from "../formik/FormikWrapper"
import { useState } from "react"
import PopUpLoad from "../../alert/PopUpLoad"

export default function DeleteAccountValidationForm({prevFormStep, onConfirm}){
    const [loading, setLoading] = useState(false)
    const initialValues = {
        confirmationPassword: ""
    }

    const onSubmit = async(values, { setFieldError }) => {
        setLoading(true);
        try{
            const res = await deleteUserProfile({
                password: values.confirmationPassword
            })
            if(res.error){
                console.log(res.error)
            }else{
                onConfirm()
            }
        }catch(error){
            if(error.message.includes("auth/invalid-credential")){
                setFieldError("confirmationPassword", "Kata sandi yang Anda masukkan tidak sesuai dengan kredensial Anda!")
            }else if(error.message.includes("auth/too-many-requests")){
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
            children={(formik) => (
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
        />
    )
}