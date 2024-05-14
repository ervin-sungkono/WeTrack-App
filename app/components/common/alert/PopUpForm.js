import PopUp from "./PopUp"

export default function PopUpForm({
    title, 
    titleSize = 'default',
    size,
    message,
    wrapContent = false,
    children
}){

    const getTitleSize = () => {
        switch(titleSize){
            case 'large':
                return 'text-xl md:text-3xl font-bold'
            case 'default':
                return 'text-lg md:text-2xl font-semibold'
        }
    }

    return (
        <PopUp size={size}>
            <div className={`w-full flex flex-col ${wrapContent ? "h-auto" : "h-full"} overflow-y-auto gap-4 md:gap-6 px-4 py-4 md:px-8 md:py-6 bg-white text-dark-blue rounded-lg shadow-lg`}>
                {(title || message) && <div className="flex flex-col gap-1">
                    {title && <div className={`${getTitleSize()} text-dark-blue`}>{title}</div>}
                    {message && <p className="text-xs md:text-sm text-dark-blue/80">{message}</p>}
                </div>}
                <div className="h-full overflow-y-auto">
                    {children}
                </div>
            </div>
        </PopUp>
    )
}