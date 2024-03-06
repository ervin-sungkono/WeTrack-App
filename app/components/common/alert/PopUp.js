export default function PopUp({width, children}) {
    return (
        <div className="fixed top-0 left-0 w-full h-full z-[10000] bg-black/50">
            <div className="w-full max-w-2xl px-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                {children}
            </div>
        </div>
    )
}