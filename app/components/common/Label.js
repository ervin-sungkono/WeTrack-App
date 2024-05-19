import { pickTextColorBasedOnBgColor } from "@/app/lib/color";

export default function Label({ color = '#000000', text }){
    return(
        <div className="flex flex-grow-0">
            <div className="flex h-[20px] items-center rounded-full px-2" style={{background: color}}>
                <p className="text-[10.8px] md:text-xs leading-none font-semibold" style={{color: pickTextColorBasedOnBgColor(color)}}>{text}</p>
            </div>
        </div>
    )
}