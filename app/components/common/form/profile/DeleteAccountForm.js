import PopUpMultiStepForm from "../../alert/PopUpMultiStepForm"
import DeleteAccountConfirmationForm from "./DeleteAccountConfirmationForm"
import DeleteAccountValidationForm from "./DeleteAccountValidationForm"

export default function DeleteAccountForm({onConfirm, onClose}){
    const steps = [
        {
            label: "Konfirmasi Hapus Akun",
            Form: (props) => <DeleteAccountConfirmationForm {...props}/>,
            PopUpProps: {
                title:"Konfirmasi Penghapusan Akun",
                message:"Apakah Anda yakin ingin menghapus akun Anda?"
            }
        },
        {
            label: "Validasi Hapus Akun",
            Form: (props) => <DeleteAccountValidationForm {...props} onConfirm={onConfirm}/>,
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