"use client"
import { useState } from "react"
import PopUpForm from "./PopUpForm"

export default function PopUpMultiStepForm({steps, onConfirm, onClose, error, errorMessage}){
    const [formStep, setFormStep] = useState(0)

    const prevFormStep = () => setFormStep((currentStep) => currentStep - 1)
    const nextFormStep = () => setFormStep((currentStep) => currentStep + 1)

    return (
        <PopUpForm>
            <div>
                {steps.map((step, index) => (
                    <div className={`text-xs md:text-sm font-medium py-3 flex-grow border-b-[3px] 
                        ${formStep === index ? "" : "hidden xs:block"}
                        ${formStep >= index ? "border-b-basic-blue text-basic-blue" : "border-b-dark-blue/60 text-dark-blue/60"}`}
                        key={step.label}
                    >
                        {index + 1}. {step.label}
                    </div>
                ))}
            </div>
            <div>
                {steps.map((step, index) => (
                    formStep === index && <step.Form nextFormStep={nextFormStep} prevFormStep={prevFormStep} onConfirm={onConfirm} onClose={onClose} error={error} errorMessage={errorMessage} key={step.label}/>
                ))}
            </div>
        </PopUpForm>
    )
}