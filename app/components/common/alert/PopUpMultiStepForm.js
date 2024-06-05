"use client"
import { useState } from "react"
import PopUpForm from "./PopUpForm"

export default function PopUpMultiStepForm({steps, onClose}){
    const [formStep, setFormStep] = useState(0)

    const prevFormStep = () => setFormStep((currentStep) => currentStep - 1)
    const nextFormStep = () => setFormStep((currentStep) => currentStep + 1)

    return (
        <div>
            {steps.map((step, index) => (
                formStep === index && 
                (<PopUpForm
                    key={step.label}
                    {...step.PopUpProps}
                    titleSize="large"
                    wrapContent
                >
                    <step.Form 
                        nextFormStep={nextFormStep} 
                        prevFormStep={prevFormStep} 
                        onClose={onClose} 
                    />
                </PopUpForm>)
            ))}
        </div>
    )
}