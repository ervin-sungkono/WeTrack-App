"use client"
import { useEffect, useRef } from "react"
import { initPopovers } from "flowbite"

export default function CustomPopover({ id, content, type, children }){
    const popoverRef = useRef(null)

    useEffect(() => {
        if(popoverRef.current){
            initPopovers();
        }
    }, [])

    return(
        <div ref={popoverRef}>
            <div data-popover-target={id}>
                {children}
            </div>
            <div data-popover id={id} role="tooltip" className={`border-4 ${type === "Task" ? "border-basic-blue" : "border-warning-yellow"} absolute whitespace-nowrap invisible inline-block px-3 py-2 text-sm text-black transition-opacity duration-300 bg-white rounded-lg shadow-sm opacity-0 z-fixed`}>
                {content}
                <div data-popper-arrow></div>
            </div>
        </div>
    )
}