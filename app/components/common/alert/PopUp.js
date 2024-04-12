export default function PopUp({size = 'default', children}) {
    const getSizeClass = () => {
        switch(size){
            case 'small':
                return `max-w-md lg:max-w-xl`
            case 'default':
                return `max-w-2xl lg:max-w-4xl`
        }
    }
    return (
        <div className="fixed top-0 left-0 w-full h-full z-[10000] bg-black/50">
            <div className={`w-full ${getSizeClass()} px-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}>
                {children}
            </div>
        </div>
    )
}