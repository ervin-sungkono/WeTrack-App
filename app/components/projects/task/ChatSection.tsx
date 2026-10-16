"use client";

import { useEffect, useState } from "react";
import Button from "../../common/button/Button";
import ChatModal from "./chat/ChatModal";
import ChatBox from "./chat/ChatBox";
import { RiMessage2Fill as ChatIcon } from "react-icons/ri";
import { getDocumentReference, getTaskScopedQueryReference } from "@/app/firebase/util";
import { getDoc, onSnapshot } from "firebase/firestore";
import { sortDateFn } from "@/app/lib/helper";
import { useFirebaseAuthBridge } from "@/app/components/providers/AuthProviders";
import type { ChatMessage, UserSummary } from "@/app/types/domain";

type ChatSectionProps = { taskId: string; projectId: string; title: string };

export default function ChatSection({ taskId, projectId, title }: ChatSectionProps) {
  const [chatModal, setChatModal] = useState(false);
  const [chatData, setChatData] = useState<ChatMessage[]>([]);
  const { authReady } = useFirebaseAuthBridge();

  useEffect(() => {
    if (!taskId || !projectId || !authReady) return;
    let active = true;
    const reference = getTaskScopedQueryReference({ collectionName: "chats", taskId, projectId });
    const unsubscribe = onSnapshot(reference, async (snapshot) => {
      try {
        const updatedChats = await Promise.all(snapshot.docs.map(async (document): Promise<ChatMessage> => {
          const data = document.data();
          let sender: UserSummary | null = null;
          if (data.senderId) {
            const userSnapshot = await getDoc(getDocumentReference({ collectionName: "users", id: data.senderId }));
            if (userSnapshot.exists()) {
              const profile = userSnapshot.data();
              sender = { id: userSnapshot.id, fullName: profile.fullName, profileImage: profile.profileImage };
            }
          }
          return { ...data, id: document.id, sender };
        }));
        if (active) setChatData(sortDateFn({ data: updatedChats, sortDirection: "asc" }));
      } catch (error) {
        console.error("Failed to load task chats", error);
      }
    }, (error) => console.error("Task chats listener failed", error));
    return () => { active = false; unsubscribe(); };
  }, [authReady, projectId, taskId]);

  return <div className="flex flex-col gap-1 md:gap-2">
    <p className="font-semibold text-xs md:text-sm flex-grow">Rekomendasi AI</p>
    <div className="flex items-start flex-col gap-2.5">
      {chatData.length > 0 ? <div className="relative max-h-[300px] overflow-hidden pb-4">
        <div className="absolute bottom-0 w-full h-10 bg-gradient-to-t from-white to-transparent z-20" />
        <ChatBox {...chatData[chatData.length - 1]} fullWidth />
      </div> : <div className="w-full flex flex-col items-center gap-2 py-8">
        <ChatIcon size={48} className="text-dark-blue/60" />
        <p className="text-xs md:text-sm text-dark-blue/80 text-center">Belum ada riwayat percakapan dengan AI.</p>
      </div>}
      <Button size="sm" onClick={() => setChatModal(true)}><div className="flex gap-2 items-center"><ChatIcon size={16} /><p>Bicara dengan AI</p></div></Button>
    </div>
    {chatModal && <ChatModal title={title} taskId={taskId} chats={chatData} onClose={() => setChatModal(false)} />}
  </div>;
}
