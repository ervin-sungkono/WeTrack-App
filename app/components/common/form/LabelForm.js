"use client"
import PopUpForm from "../alert/PopUpForm"
import Button from "../button/Button"

export default function LabelForm({ labels, onCancel }){
    return(
        <PopUpForm size={"small"}>
            Test
            <Button variant="secondary" onClick={onCancel}>
                Cancel
            </Button>
        </PopUpForm>
    )
}