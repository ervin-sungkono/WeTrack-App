import PopUpForm from "../alert/PopUpForm"

export default function DeleteAccountForm({onConfirm, onClose}){
    return (
        <PopUpForm
            variant="danger"
            title={"Delete Account"}
            message={"Are you sure to delete your account?"}
            onConfirm={onConfirm}
            onConfirmOption={"Yes"}
            onClose={onClose}
            onCloseOption={"No"}
        />
    )
}