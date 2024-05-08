import Navbar from "../common/navbar/Navbar"

export default function MainLayout({ children, hideNavbar = false }){
    return(
        <div className="flex flex-col fixed top-0 left-0 bottom-0 right-0 bg-gray-100 pt-20">
            { !hideNavbar && <Navbar/>}
            <main className="container-fluid max-h-full mx-auto overflow-y-auto w-full">
                {children}
            </main>
        </div>
    )
}