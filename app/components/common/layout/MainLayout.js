import Navbar from "../navbar/Navbar"

export default function MainLayout({ children, hideMenu = true }){
    return(
        <div className="flex flex-col fixed top-0 left-0 bottom-0 right-0 bg-gray-100 pt-20">
            <Navbar hideMenu={hideMenu}/>
            <main className="container-fluid max-h-full mx-auto overflow-auto w-full">
                {children}
            </main>
        </div>
    )
}