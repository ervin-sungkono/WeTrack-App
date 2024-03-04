import Button from "../button/Button"
import PopUp from "./PopUp"

export default function PopUpForm({variant = 'primary', title, message, onConfirm, onConfirmOption, onClose, onCloseOption, children}){

    const getVariantClass = () => {
        switch(variant){
            case 'danger':
                return 'bg-danger-red text-white'
            case 'success':
                return 'bg-basic-blue text-white'
            case 'warning':
                return 'bg-warning-yellow text-black'
            case 'primary':
                return 'bg-basic-blue text-white'
            case 'secondary':
                return 'bg-white text-basic-blue'
        }
    }

    const getConfirmButtonVariantClass = () => {
        switch(variant){
            case 'danger':
                return 'white-danger-secondary'
            case 'success':
                return 'white-basic-blue'
            case 'warning':
                return 'white-warning-yellow'
            case 'primary':
                return 'pop-up-secondary'
            case 'secondary':
                return 'pop-up-primary'
        }
    }

    const getCloseButtonVariantClass = () => {
        switch(variant){
            case 'danger':
                return 'white-danger'
            case 'success':
                return 'white-basic-blue'
            case 'warning':
                return 'white-warning-yellow'
            case 'primary':
                return 'pop-up-primary'
            case 'secondary':
                return 'pop-up-secondary'
        }
    }

    return (
        <PopUp>
            <div className={`p-4 md:p-8 ${getVariantClass()} rounded-lg shadow-lg`}>
                <h1 className="text-lg md:text-xl font-bold">{title}</h1>
                <p className="text-xs md:text-sm">{message}</p>
                <div className="mt-4 md:mt-8">
                    {children}
                </div>
                <div className="flex gap-2 md:gap-4 items-center justify-end">
                    {onConfirm && onConfirmOption && (
                        <Button size="sm" variant={`${getConfirmButtonVariantClass()}`} onClick={onConfirm}>{onConfirmOption}</Button>
                    )}
                    {onClose && onCloseOption && (
                        <Button size="sm" variant={`${getCloseButtonVariantClass()}`} onClick={onClose}>{onCloseOption}</Button>
                    )}
                </div>
            </div>
        </PopUp>
    )
}