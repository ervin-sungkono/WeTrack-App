import PopUp from "./PopUp"

export default function PopUpForm({
    title, 
    message, 
    children
}){
    return (
        <PopUp>
            <div className={`p-4 md:p-8 bg-white text-dark-blue rounded-lg shadow-lg`}>
                <h1 className="text-lg md:text-xl font-bold">{title}</h1>
                {message && <p className="text-xs md:text-sm">{message}</p>}
                <div className="mt-4 md:mt-8">
                    {children}
                </div>
            </div>
        </PopUp>
    )
}