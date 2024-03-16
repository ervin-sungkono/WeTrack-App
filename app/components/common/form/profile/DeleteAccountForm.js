import PopUpForm from "../../alert/PopUpForm"
import Button from "../../button/Button"

export default function DeleteAccountForm({onConfirm, onClose}){
    return (
        <PopUpForm
            title={"Hapus Akun"}
            titleSize={"large"}
            message={"Apakah Anda yakin menghapus akun Anda?"}
        >
            <div className="flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
                <Button variant="danger" onClick={onConfirm}>Hapus</Button>
                <Button variant="secondary" onClick={onClose}>Batal</Button>
            </div>
        </PopUpForm>
    )
}