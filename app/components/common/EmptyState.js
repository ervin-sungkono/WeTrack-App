import Image from "next/image"

export default function EmptyState({ message = "Belum ada data yang tersedia.." }){
    return(
        <div className="w-full h-full flex flex-col justify-center items-center gap-2">
            <Image
                width={320}
                height={320}
                src={"/images/EmptyState.svg"}
                alt=""
            />
            <p className="text-sm md:text-base text-dark-blue/80">{message}</p>
        </div>
    )
}