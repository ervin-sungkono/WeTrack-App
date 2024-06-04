import PopUpMultiStepForm from "../../alert/PopUpMultiStepForm"
import DeleteAccountConfirmationForm from "./DeleteAccountConfirmationForm"
import DeleteAccountValidationForm from "./DeleteAccountValidationForm"

export default function DeleteAccountForm({onConfirm, onClose}){
    const steps = [
        {
            label: "Konfirmasi Hapus Akun",
            Form: (props) => 
                <DeleteAccountConfirmationForm {...props}/>
        },
        {
            label: "Validasi Hapus Akun",
            Form: (props) => 
                <DeleteAccountValidationForm {...props}/>
        }
    ]
    return (
        <PopUpMultiStepForm
            steps={steps}
            onConfirm={onConfirm}
            onClose={onClose}
        />
    )
}