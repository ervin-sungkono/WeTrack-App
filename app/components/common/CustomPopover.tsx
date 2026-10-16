"use client"
import { useEffect } from "react"
import { initPopovers } from "flowbite"
import type { ReactNode } from "react"

type CustomPopoverProps = { id: string; content: ReactNode; children?: ReactNode }

export default function CustomPopover({ id, content, children }: CustomPopoverProps){
    useEffect(() => {
        initPopovers()
    }, [])

    return(
        <div>
            <div data-popover-target={id} className={`z-100`}>
                {children}
            </div>
            <div data-popover id={id} role="tooltip" className={`w-[270px] border-2 border-basic-blue/30 absolute text-wrap invisible inline-block px-3 py-2 text-sm text-black bg-white rounded-lg shadow-sm opacity-0 z-fixed`}>
                {content}
                <div data-popper-arrow className="border-2 border-basic-blue/30"></div>
            </div>
        </div>
    )
}
