import { pickTextColorBasedOnBgColor } from "@/app/lib/color";

export default function Label({ color = '#000000', text }){
    return(
        <div className="rounded-full px-2 py-1 text-[10.8px] md:text-xs font-medium" style={{color: pickTextColorBasedOnBgColor(color), background: color}}>
            {text}
        </div>
    )
}