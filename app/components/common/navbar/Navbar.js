import { getServerSession } from "next-auth"
import NavbarMenu from "./NavbarMenu"

export default async function Navbar({ hideMenu }){
    const session = await getServerSession() ?? true
    
    console.log(session)
    return(
        <nav className="navbar w-full fixed z-fixed top-0 bg-white shadow-md">
            <div className="container h-20 flex justify-between items-center">
                <NavbarMenu session={session} hideMenu={hideMenu}/>
            </div>
        </nav>
    )
}