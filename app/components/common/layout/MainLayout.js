import Navbar from "../navbar/Navbar"

export default function MainLayout({ children, hideMenu = true }){
    return(
        <div className="flex fixed top-0 left-0 bottom-0 right-0 bg-gray-100 pt-20">
            <Navbar hideMenu={hideMenu}/>
            <main className="container max-h-full mx-auto overflow-auto">
                {children}
            </main>
        </div>
    )
}