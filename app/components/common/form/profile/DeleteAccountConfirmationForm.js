import PopUpForm from "../../alert/PopUpForm"
import Button from "../../button/Button"

export default function DeleteAccountConfirmationForm({nextFormStep, onClose}){
    
    return (
        <div className="flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
            <Button variant="danger" onClick={nextFormStep}>Ya</Button>
            <Button variant="secondary" onClick={onClose}>Tidak</Button>
        </div>
    )
}