"use client"
import { useEffect } from "react"
import { initTooltips } from "flowbite"

export default function CalendarTooltip({ id, content, children, type }){
    useEffect(() => {
        initTooltips()
    }, [])

    const getType = () => {
        switch(type){
            case "Task":
                return "bg-white text-black border-basic-blue border-8"
            case "SubTask":
                return "bg-white text-black border-warning-yellow border-8"
            default:
                return "bg-white text-black"
        }
    }

    return(
        <div>
            <div data-tooltip-target={id}>
                {children}
            </div>
            <div id={id} role="tooltip" className={`absolute whitespace-nowrap invisible inline-block px-5 py-4 transition-opacity duration-300 ${getType()} rounded-xl shadow-sm opacity-0 tooltip z-fixed`}>
                {content}
                {/* <div className="tooltip-arrow" data-popper-arrow></div> */}
            </div>
        </div>
    )
}