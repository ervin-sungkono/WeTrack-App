"use client"
import { SessionProvider } from "next-auth/react"
import NavbarMenu from "./NavbarMenu"

export default function Navbar({ hideMenu }){
    return(
        <SessionProvider>
            <nav className="navbar w-full fixed z-fixed top-0 bg-white shadow-md">
                <div className="container h-20 flex justify-between items-center">
                    <NavbarMenu hideMenu={hideMenu}/>
                </div>
            </nav>
        </SessionProvider>
    )
}