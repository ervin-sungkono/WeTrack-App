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
                return 'text-2xl md:text-3xl font-bold'
            case 'default':
                return 'text-xl md:text-2xl font-semibold'
        }
    }

    return (
        <PopUp>
            <div className={`p-4 md:p-8 bg-white text-dark-blue rounded-lg shadow-lg`}>
                <div className={`${getTitleSize()}`}>
                    {title}
                </div>
                {message && <p className="text-xs md:text-sm">{message}</p>}
                <div className="mt-4 md:mt-8">
                    {children}
                </div>
            </div>
        </PopUp>
    )
}