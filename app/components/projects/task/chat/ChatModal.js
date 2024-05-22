"use client"
import { sendChat } from "@/app/lib/fetch/chat";
import { useEffect, useRef, useState } from "react";
import PopUp from "@/app/components/common/alert/PopUp";
import ChatInput from "./ChatInput";
import ChatBox from "./ChatBox";
import EmptyState from "@/app/components/common/EmptyState";
import { TailSpin } from "react-loader-spinner";

import { 
    IoIosCloseCircle as CloseIcon, 
    IoIosArrowDown as DownArrow 
} from "react-icons/io";

export default function ChatModal({ title, taskId, chats, onClose }){
    const [pending, setPending] = useState(false)
    const bottomRef = useRef()
    const [isBottom, setIsBottom] = useState(true)

    useEffect(() => {
        scrollToBottom()
    }, [chats])

    const addChat = async(content) => {
        setPending(true)
        await sendChat({ taskId, content })
        setPending(false)
    }

    const scrollToBottom = () => {
        if(!bottomRef.current) return
        bottomRef.current.scrollIntoView({
            block: "end",
        })
    }

    const checkBottom = (e) => {
        const el = e.target
        const scrollableHeight = el.scrollHeight - el.clientHeight

        setIsBottom(el.scrollTop >= scrollableHeight)
    }

    return(
        <PopUp>
            <div className={`w-full h-full flex flex-col gap-4 md:gap-6 px-4 py-4 md:px-8 md:py-6 bg-white text-dark-blue rounded-lg shadow-lg`}>
                <div className="flex gap-2 items-center">
                    <div className="text-lg md:text-2xl font-semibold flex-grow truncate">Obrolan - {title}</div>
                    <button onClick={onClose}>
                        <CloseIcon size={32} className="text-basic-blue"/>
                    </button>
                </div>
                <div className="relative w-full h-full flex flex-col overflow-x-hidden overflow-y-auto">
                    { chats.length > 0 ? 
                    <div className="w-full h-full flex flex-col gap-3 overflow-y-auto mb-14 md:mb-16 custom-scrollbar pr-2" onScroll={checkBottom}>
                        {chats?.map(chat => (
                            <ChatBox
                                key={chat.id}
                                {...chat}
                            />
                        ))}
                        {pending && 
                        <div className="w-full flex flex-col gap-2 justify-center items-center">
                            <TailSpin 
                                color="#47389F"
                                height={32}
                                width={32}
                            />
                            <p className="text-xs text-center text-dark-blue/80">Pesan sedang diproses..</p>
                        </div>}
                        <div ref={bottomRef} className="w-full h-0"></div>
                    </div> :
                    <div className="w-full h-full pb-12">
                        <EmptyState message="Belum ada riwayat percakapan, kirim sebuah pesan untuk memulai."/>
                    </div>}
                    { !isBottom && 
                    <button onClick={scrollToBottom} className="absolute bottom-16 right-2 p-2 bg-white border text-dark-blue hover:text-basic-blue hover:border-basic-blue/60 border-dark-blue/20 rounded-full transition-colors duration-300">
                        <DownArrow size={20}/>
                    </button>}
                    <ChatInput 
                        name={`chat-${taskId}`} 
                        onSubmit={addChat}
                        placeholder={"Kirim sebuah pesan..."}
                    />
                </div>
            </div>
        </PopUp>
    )
}