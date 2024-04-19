"use client"
import { useEffect } from "react"
import { initTooltips } from "flowbite"

export default function CustomTooltip({ id, content, children }){
    useEffect(() => {
        initTooltips()
    }, [])

    return(
        <div>
            <div data-tooltip-target={id}>
                {children}
            </div>
            <div id={id} role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-700 rounded-lg shadow-sm opacity-0 tooltip">
                {content}
                <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
        </div>
    )
}