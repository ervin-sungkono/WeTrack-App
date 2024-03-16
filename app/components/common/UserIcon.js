'use client'
import { useEffect, useState } from "react"
import { 
    stringToColour, 
    pickTextColorBasedOnBgColor 
} from "@/app/lib/color"
import Image from "next/image"

export default function UserIcon({ src, alt = "", fullName, size = 'md' }){
    const [error, setError] = useState(null)
    const userInitials = fullName?.toUpperCase().split(' ').map(word => word[0]).join('').slice(0, 2)
    const backgroundColor = stringToColour(fullName ?? "random")
    const textColor = pickTextColorBasedOnBgColor(backgroundColor)
  
    useEffect(() => {
      setError(null)
    }, [src])

    const getTextSize = () => {
        switch(size){
            case 'sm':
                return "text-xs"
            case 'md':
                return "text-sm"
            case 'lg':
                return "text-md"
            case 'xl':
                return "text-lg"
            case 'team':
                return "text-lg md:text-2xl"
            case 'profile':
                return "text-xl md:text-3xl"
        }
    }

    const getIconSize = () => {
        switch(size){
            case 'sm':
                return "w-8 h-8"
            case 'md':
                return "w-10 h-10"
            case 'lg': 
                return "w-12 h-12"
            case 'xl':
                return "w-16 h-16"
            case 'team':
                return "w-16 md:w-20 h-16 md:h-20"
            case 'profile':
                return "w-20 md:w-28 h-20 md:h-28 border-4 border-white"
        }
    }

    if(!src || error) return(
        <div 
            className={`relative inline-flex items-center justify-center ${getIconSize()} overflow-hidden rounded-full`}
            style={{backgroundColor: backgroundColor}}
        >
            <span 
                className={`font-semibold ${getTextSize()}`}
                style={{color: textColor}}
            >
                {userInitials}
            </span>
        </div>
    )
  
    return (
        <div className={`relative ${getIconSize()}`}>
            <Image
                alt={alt}
                onError={setError}
                src={src}
                fill
            />
        </div>
    )
}