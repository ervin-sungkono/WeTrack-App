"use client"
import { useState } from "react"

export default function MultiStepForm({ steps }){
    const [formStep, setFormStep] = useState(0)

    const nextFormStep = () => setFormStep((currentStep) => currentStep + 1)

    const prevFormStep = () => setFormStep((currentStep) => currentStep - 1)

    return(
        <div className="flex flex-col gap-6 pb-6 md:pb-8">
            <div className="flex items-center gap-2">
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
                    formStep === index && <step.Form nextFormStep={nextFormStep} prevFormStep={prevFormStep} key={step.label}/>
                ))}
            </div>
        </div>
    )
}