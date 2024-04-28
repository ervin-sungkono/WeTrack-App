import PopUpForm from "../../alert/PopUpForm"
import PopUpMultiStepForm from "../../alert/PopUpMultiStepForm"
import Button from "../../button/Button"
import DeleteAccountConfirmationForm from "./DeleteAccountConfirmationForm"
import DeleteAccountValidationForm from "./DeleteAccountValidationForm"

export default function DeleteAccountForm({onConfirm, onClose, error, errorMessage}){
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
            error={error}
            errorMessage={errorMessage}
        />
    )
}