'use client'
import { useEffect, useState } from "react"
import { 
    stringToColour, 
    pickTextColorBasedOnBgColor 
} from "@/app/lib/color"
import Image from "next/image"

export default function UserIcon({ src, alt, fullName }){
    const [error, setError] = useState(null)
    const userInitials = fullName.toUpperCase().split(' ').map(word => word[0]).join('').slice(0, 2)
    const backgroundColor = stringToColour(fullName)
    const textColor = pickTextColorBasedOnBgColor(backgroundColor)
  
    useEffect(() => {
      setError(null)
    }, [src])

    if(error) return(
        <div 
            className={`relative inline-flex items-center justify-center w-10 h-10 overflow-hidden rounded-full`}
            style={{backgroundColor: backgroundColor}}
        >
            <span 
                className={`font-semibold`}
                style={{color: textColor}}
            >
                {userInitials}
            </span>
        </div>
    )
  
    return (
        <div>
            <Image
                alt={alt}
                onError={setError}
                src={src}
            />
        </div>
      
    )
}