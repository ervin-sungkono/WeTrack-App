import Image from "next/image"
import LinkButton from "./button/LinkButton"

export default function EmptyState({ message = "Belum ada data yang tersedia.", action, href }){
    return(
        <div className="w-full h-full flex flex-col justify-center items-center gap-2">
            <Image
                width={320}
                height={320}
                src={"/images/EmptyState.svg"}
                alt="Belum ada data yang tersedia."
                className="px-4 grayscale"
            />
            <p className="text-xs md:text-sm text-dark-blue/80 text-center">{message}</p>
            {action && (
                <LinkButton href={href} variant="primary" size={`md`} className="mt-2 md:mt-4 px-2 xl:px-4">
                    {action}
                </LinkButton>
            )}
        </div>
    )
}