import PopUp from "@/app/components/common/alert/PopUp";

import { IoIosCloseCircle as CloseIcon } from "react-icons/io";
import ChatInput from "./ChatInput";
import ChatBox from "./ChatBox";
import { sendChat } from "@/app/lib/fetch/chat";

export default function ChatModal({ title, taskId, chats, onClose }){
    const addChat = async(content) => {
        await sendChat({ taskId, content })
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
                <div className="relative w-full h-full flex flex-col gap-4 overflow-y-auto">
                    <div className="w-full h-full flex flex-col gap-3 overflow-y-auto mb-12 pb-4 custom-scrollbar pr-2">
                        {chats?.map(chat => (
                            <ChatBox
                                key={chat.id}
                                {...chat}
                            />
                        ))}
                    </div>
                    <ChatInput 
                        name={`chat-${taskId}`} 
                        onSubmit={addChat}
                        placeholder={"Kirim sebuah pesan.."}
                    />
                </div>
            </div>
        </PopUp>
    )
}