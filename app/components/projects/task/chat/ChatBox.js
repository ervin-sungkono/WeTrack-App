"use client"
import UserIcon from "@/app/components/common/UserIcon"
import { listDateFormat } from "@/app/lib/date"

export default function ChatBox({ role, content, sender, createdAt, pending = false }){
    const isUser = role === "user"
    return(
        <div className={`flex gap-4 ${isUser ? "flex-row-reverse pl-8 sm:pl-24" : "flex-row pr-8 sm:pr-24"}`}>
            <div>
                <UserIcon 
                    fullName={sender && sender.fullName}
                    src={isUser ? sender.profileImage?.attachmentStoragePath : "/images/ai-profile.png"}
                    size="sm"
                />
            </div>
            <div className={`relative py-2 px-3 rounded-b-md ${isUser ? "bg-purple-100 rounded-tl-md text-right" : "bg-gray-100 rounded-tr-md text-left"} before:absolute before:w-0 before:h-0  before:top-0 before:right-auto before:bottom-auto before:border-[12px] before:border-solid  before:border-transparent ${isUser ? "before:-right-3 before:border-t-purple-100" : "before:-left-3 before:border-t-gray-100"}`}>
                <p className="text-sm font-semibold text-dark-blue mb-1">
                    {isUser ? sender.fullName : "Assisten WeTrack"}
                </p>
                <p className="text-xs md:text-sm text-dark-blue/80 mb-2">
                    {content}
                </p>
                <div className="w-full flex justify-end">
                    <p className="text-xs text-dark-blue/60">{listDateFormat(createdAt)}</p>
                </div>
            </div>
        </div>
    )
}