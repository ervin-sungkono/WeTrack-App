import PopUpForm from "../../alert/PopUpForm"
import Button from "../../button/Button"

export default function DeleteAccountConfirmationForm({nextFormStep, onClose}){
    
    return (
        <PopUpForm
            title={"Konfirmasi Penghapusan Akun"}
            titleSize={"large"}
            message={"Apakah Anda yakin ingin menghapus akun Anda?"}
            wrapContent
        >
            <div className="flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
                <Button variant="secondary" onClick={onClose}>Tidak</Button>
                <Button variant="danger" onClick={nextFormStep}>Ya</Button>
            </div>
        </PopUpForm>
    )
}