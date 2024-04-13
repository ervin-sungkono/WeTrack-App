import { pickTextColorBasedOnBgColor } from "@/app/lib/color";

export default function Label({ color = '#000000', text }){
    return(
        <div className="flex h-[20px] items-center rounded-full px-2" style={{background: color}}>
            <p className="text-xs leading-none font-medium" style={{color: pickTextColorBasedOnBgColor(color)}}>{text}</p>
        </div>
    )
}