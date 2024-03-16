"use client"
import dynamic from "next/dynamic"
import { useState } from "react"
import { SessionProvider } from "next-auth/react"

import NavbarMenu from "./NavbarMenu"

const CreateIssueForm = dynamic(() => import("../form/CreateIssueForm"))

export default function Navbar({ hideMenu }){
    const [formVisible, setFormVisibility] = useState(false)

    return(
        <SessionProvider>
            <nav className="navbar w-full fixed z-fixed top-0 bg-white shadow-md">
                <div className="container h-20 flex justify-between items-center">
                    <NavbarMenu showForm={() => setFormVisibility(true)} hideMenu={hideMenu}/>
                </div>
            </nav>
            {formVisible && <CreateIssueForm onCancel={() => setFormVisibility(false)}/>}
        </SessionProvider>
    )
}