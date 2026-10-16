import PopUpMultiStepForm from "../../alert/PopUpMultiStepForm"
import DeleteAccountConfirmationForm from "./DeleteAccountConfirmationForm"
import DeleteAccountValidationForm from "./DeleteAccountValidationForm"
import type { PopUpMultiStep, PopUpMultiStepComponentProps } from "../../alert/PopUpMultiStepForm"

type DeleteAccountFormProps = { onConfirm: () => void; onClose: () => void }

export default function DeleteAccountForm({onConfirm, onClose}: DeleteAccountFormProps){
    const ConfirmationStep = (props: PopUpMultiStepComponentProps) => <DeleteAccountConfirmationForm {...props}/>
    const ValidationStep = (props: PopUpMultiStepComponentProps) => <DeleteAccountValidationForm {...props} onConfirm={onConfirm}/>
    const steps: PopUpMultiStep[] = [
        {
            label: "Konfirmasi Hapus Akun",
            Form: ConfirmationStep,
            PopUpProps: {
                title:"Konfirmasi Penghapusan Akun",
                message:"Apakah Anda yakin ingin menghapus akun Anda?"
            }
        },
        {
            label: "Validasi Hapus Akun",
            Form: ValidationStep,
            PopUpProps: {
                title:"Validasi Penghapusan Akun",
                message:"Masukkan kata sandi yang Anda gunakan dalam akun ini."
            }
        }
    ]
    return (
        <PopUpMultiStepForm
            steps={steps}
            onClose={onClose}
        />
    )
}
