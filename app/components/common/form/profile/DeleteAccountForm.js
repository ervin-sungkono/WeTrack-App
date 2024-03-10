import PopUpForm from "../../alert/PopUpForm"
import Button from "../../button/Button"

export default function DeleteAccountForm({onConfirm, onClose}){
    return (
        <PopUpForm
            title={"Delete Account"}
            titleSize={"large"}
            message={"Are you sure you want to delete your account?"}
        >
            <div className="flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
                <Button variant="danger" onClick={onConfirm}>Delete</Button>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
            </div>
        </PopUpForm>
    )
}