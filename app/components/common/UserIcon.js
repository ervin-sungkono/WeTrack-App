'use client'
import { useEffect, useState } from "react"
import { 
    stringToColour, 
    pickTextColorBasedOnBgColor 
} from "@/app/lib/color"
import Image from "next/image"

export default function UserIcon({ src, alt = "", fullName, size = 'md' }){
    const [error, setError] = useState(null)
    const userInitials = fullName.toUpperCase().split(' ').map(word => word[0]).join('').slice(0, 2)
    const backgroundColor = stringToColour(fullName)
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
        }
    }

    const getIconSize = () => {
        switch(size){
            case 'sm':
                return "w-8 h-8"
            case 'md':
                return "w-10 h-10"
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