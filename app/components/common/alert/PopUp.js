export default function PopUp({size = 'default', children, open = true}) {
    const getSizeClass = () => {
        switch(size){
            case 'small':
                return `max-w-md lg:max-w-xl`
            case 'default':
                return `max-w-2xl lg:max-w-4xl`
        }
    }
    return (
        <div className={`fixed ${open ? "flex" : "hidden"} justify-center items-center top-0 left-0 w-full h-full z-[10000] bg-black/50`}>
            <div className={`flex justify-center items-center w-full ${getSizeClass()} h-full max-h-[80vh] px-6 overflow-y-auto`}>
                {children}
            </div>
        </div>
    )
}