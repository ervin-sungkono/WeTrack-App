"use client"
import { useEffect, useRef } from "react"
import { initPopovers } from "flowbite"

export default function CustomPopover({ id, content, children }){
    const popoverRef = useRef(null)

    useEffect(() => {
        if(popoverRef.current){
            initPopovers();
        }
    }, [])

    return(
        <div ref={popoverRef}>
            <div data-popover-target={id} className={`z-almostFixed`}>
                {children}
            </div>
            <div data-popover id={id} role="tooltip" className={`w-[270px] border-2 border-basic-blue/30 absolute text-wrap invisible inline-block px-3 py-2 text-sm text-black bg-white rounded-lg shadow-sm opacity-0 z-fixed`}>
                {content}
                <div data-popper-arrow className="border-2 border-basic-blue/30"></div>
            </div>
        </div>
    )
}