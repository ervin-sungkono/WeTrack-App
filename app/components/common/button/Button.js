export default function Button({ type = 'button', variant = 'primary', size = 'md', onClick, disabled, className, children }){
    const getSizeClass = () => {
        switch(size){
            case 'md':
                return 'text-sm md:text-base px-6 py-3'
            case 'sm':
                return 'text-xs md:text-sm px-4 py-2'
            default:
                return ''
        }
    }
    const getVariantClass = () => {
        switch(variant){
            case 'primary':
                return 'bg-basic-blue text-white'
            case 'secondary':
                return 'border text-basic-blue border-basic-blue'
            case 'gray':
                return 'bg-gray-200 text-basic-blue'
            default:
                return ''
        }
    }
    // TODO-1: Add hover state
    // TODO-2: Add disabled state
    return(
        <button 
            type={type}
            className={`${getSizeClass()} ${getVariantClass()} ${className} font-semibold rounded-md disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 transition-colors duration-300`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    )
}