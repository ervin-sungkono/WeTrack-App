"use client"
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
                    bgColor: 'bg-basic-blue',
                    textColor: 'text-white',
                    outlineTextColor: 'text-basic-blue',
                    borderClass: 'border-basic-blue',
                    hover: 'hover:bg-basic-blue/80',
                    hoverOutline: 'hover:bg-basic-blue hover:text-white'
                })
            case 'secondary':
                return ({
                    bgColor: 'bg-light-blue',
                    textColor: 'text-dark-blue',
                    outlineTextColor: 'text-light-blue',
                    borderClass: 'border-light-blue',
                    hover: 'hover:bg-light-blue/80',
                    hoverOutline: 'hover:bg-light-blue hover:text-white'
                })
            case 'success': 
                return ({
                    bgColor: 'bg-success-green',
                    textColor: 'text-white',
                    outlineTextColor: 'text-success-green',
                    borderClass: 'border-success-green',
                    hover: 'hover:bg-success-green/80',
                    hoverOutline: 'hover:bg-success-green hover:text-white'
                })
            case 'warning': 
                return ({
                    bgColor: 'bg-warning-yellow',
                    textColor: 'text-dark-blue',
                    outlineTextColor: 'text-warning-yellow',
                    borderClass: 'border-warning-yellow',
                    hover: 'hover:bg-warning-yellow/80',
                    hoverOutline: 'hover:bg-warning-yellow hover:text-dark-blue'
                })
            case 'danger':
                return({
                    bgColor: 'bg-danger-red',
                    textColor: 'text-white',
                    outlineTextColor: 'text-danger-red',
                    borderClass: 'border-danger-red',
                    hover: 'hover:bg-danger-red/80',
                    hoverOutline: 'hover:bg-danger-red hover:text-white'
                })
            case 'gray':
                return({
                    bgColor: 'bg-gray-200',
                    textColor: 'text-dark-blue',
                    outlineTextColor: 'text-gray-700',
                    borderClass: 'border-gray-400',
                    hover: 'hover:bg-gray-300',
                    hoverOutline: 'hover:bg-gray-300 hover:text-dark-blue'
                })
            default:
                return ({
                    bgColor: '',
                    textColor: '',
                    outlineTextColor: '',
                    borderClass: '',
                    hover: '',
                    hoverOutline: '',
                })
        }
    }

    const getSizeClass = () => {
        switch(size){
            case 'md':
                return 'text-xs md:text-sm px-4 md:px-6 py-2 md:py-3 rounded-md'
            case 'sm':
                return 'text-[10.8px] md:text-xs px-3 md:px-4 py-1.5 md:py-2 rounded'
        }
    }

    const getVariantClass = () => {
        const { bgColor, textColor, outlineTextColor, borderClass, hover, hoverOutline } = getButtonColor()

        if(outline){
            return `border ${borderClass} ${outlineTextColor} ${hoverOutline}`
        }
        return `${bgColor} ${textColor} ${hover}`
    }

    return(
        <button 
            type={type}
            className={`${getVariantClass()} ${getSizeClass()} ${className} font-semibold disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 transition-colors duration-300 text-nowrap`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    )
}