export default function Button({ 
    type = 'button', 
    outline = false,
    variant = 'primary',
    size = 'md', 
    onClick, 
    disabled, 
    className, 
    children 
}){
    const getButtonColor = () => {
        switch(variant){
            case 'primary':
                return ({
                    bgColor: 'basic-blue',
                    textColor: 'white',
                    borderClass: 'border-basic-blue',
                    hover: 'hover:bg-basic-blue/80',
                    hoverOutline: 'hover:bg-basic-blue hover:text-white'
                })
            case 'secondary':
                return ({
                    bgColor: 'light-blue',
                    textColor: 'dark-blue',
                    borderClass: 'border-light-blue',
                    hover: 'hover:bg-light-blue/80',
                    hoverOutline: 'hover:bg-light-blue hover:text-white'
                })
            case 'success': 
                return ({
                    bgColor: 'success-green',
                    textColor: 'white',
                    borderClass: 'border-success-green',
                    hover: 'hover:bg-success-green/80',
                    hoverOutline: 'hover:bg-success-green hover:text-white'
                })
            case 'warning': 
                return ({
                    bgColor: 'warning-yellow',
                    textColor: 'dark-blue',
                    borderClass: 'border-warning-yellow',
                    hover: 'hover:bg-warning-yellow/80',
                    hoverOutline: 'hover:bg-warning-yellow hover:text-dark-blue'
                })
            case 'danger':
                return({
                    bgColor: 'danger-red',
                    textColor: 'white',
                    borderClass: 'border-danger-red',
                    hover: 'hover:bg-danger-red/80',
                    hoverOutline: 'hover:bg-danger-red hover:text-white'
                })
            default:
                return ({
                    bgColor: '',
                    textColor: '',
                    borderClass: '',
                    hover: '',
                    hoverOutline: '',
                })
        }
    }

    const getSizeClass = () => {
        switch(size){
            case 'md':
                return 'text-xs md:text-sm px-4 md:px-6 py-2 md:py-3'
            case 'sm':
                return 'text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2'
        }
    }

    const getVariantClass = () => {
        const { bgColor, textColor, borderClass, hover, hoverOutline } = getButtonColor()

        if(outline){
            return `border ${borderClass} text-${bgColor} ${hoverOutline}`
        }
        return `bg-${bgColor} text-${textColor} ${hover}`
    }

    return(
        <button 
            type={type}
            className={`${getVariantClass()} ${getSizeClass()} ${className} font-semibold rounded-md disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 transition-colors duration-300 text-nowrap`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    )
}