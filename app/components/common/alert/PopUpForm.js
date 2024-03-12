import PopUp from "./PopUp"

export default function PopUpForm({
    title, 
    titleSize,
    message, 
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
        <PopUp>
            <div className={`flex flex-col gap-4 md:gap-6 px-6 py-4 md:px-8 md:py-6 bg-white text-dark-blue rounded-lg shadow-lg`}>
                {(title || message) && <div className="flex flex-col gap-2">
                    {title && <div className={`${getTitleSize()}`}>{title}</div>}
                    {message && <p className="text-xs md:text-sm">{message}</p>}
                </div>}
                <div>
                    {children}
                </div>
            </div>
        </PopUp>
    )
}