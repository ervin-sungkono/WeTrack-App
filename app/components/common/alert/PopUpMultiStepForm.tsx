"use client"
import { useState } from "react"
import PopUpForm from "./PopUpForm"
import type { ComponentProps, ComponentType } from "react"

export type PopUpMultiStepComponentProps = { nextFormStep: () => void; prevFormStep: () => void; onClose: () => void }
export type PopUpMultiStep = {
    label: string
    PopUpProps: Omit<ComponentProps<typeof PopUpForm>, "children">
    Form: ComponentType<PopUpMultiStepComponentProps>
}
type PopUpMultiStepFormProps = { steps: PopUpMultiStep[]; onClose: () => void }

export default function PopUpMultiStepForm({steps, onClose}: PopUpMultiStepFormProps){
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
