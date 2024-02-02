import Navbar from "../navbar/Navbar"
import Sidebar from "../sidebar/Sidebar"

export default function DashboardLayout({ children, hideSidebar }){
    return(
        <div className="flex fixed top-0 left-0 bottom-0 right-0 bg-gray-100 pt-20">
            <Navbar/>
            {!hideSidebar && <Sidebar/>}
            <div className="max-w-7xl max-h-full flex flex-col flex-grow gap-6 pt-6 pb-8 px-6 md:px-12 mx-auto overflow-auto">
                <main className="flex-grow flex flex-col gap-4 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}