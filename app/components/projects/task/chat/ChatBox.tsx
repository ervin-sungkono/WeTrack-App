"use client";

import { memo } from "react";
import type { Components } from "react-markdown";
import UserIcon from "@/app/components/common/UserIcon";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { listDateFormat } from "@/app/lib/date";
import type { ChatMessage } from "@/app/types/domain";

type ChatBoxProps = Pick<ChatMessage, "role" | "content" | "sender" | "createdAt"> & { fullWidth?: boolean };

const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const language = /language-(\w+)/.exec(className ?? "")?.[1];
    if (!language) return <code {...props} className={className}>{children}</code>;
    return <SyntaxHighlighter
      lineProps={{ style: { wordBreak: "break-all", whiteSpace: "pre-wrap" } }}
      style={vs2015}
      language={language}
      PreTag="div"
      wrapLongLines
      customStyle={{ borderRadius: "6px", fontSize: "12.8px" }}
    >{String(children).replace(/\n$/, "")}</SyntaxHighlighter>;
  },
  pre({ children, ...props }) {
    return <pre {...props} className="whitespace-pre-wrap overflow-x-auto">{children}</pre>;
  },
};

function ChatBox({ role, content, sender, createdAt, fullWidth = false }: ChatBoxProps) {
  const isUser = role === "user";
  const senderImage = typeof sender?.profileImage === "string"
    ? sender.profileImage
    : sender?.profileImage?.attachmentStoragePath ?? null;

  return <div className={`flex gap-4 ${!fullWidth && (isUser ? "flex-row-reverse xs:pl-8 sm:pl-24" : "flex-row xs:pr-8 sm:pr-24")}`}>
    <div><UserIcon fullName={sender?.fullName} src={isUser ? senderImage : "/images/ai-profile.png"} size="sm" /></div>
    <div className={`relative min-w-[160px] py-2 px-3 rounded-md ${isUser ? "bg-purple-100 text-right" : "bg-gray-100 text-left"} before:absolute before:w-0 before:h-0 before:top-2.5 before:right-auto before:bottom-auto before:border-[12px] before:border-solid before:border-transparent ${isUser ? "before:-right-3 before:border-t-purple-100" : "before:-left-3 before:border-t-gray-100"}`}>
      <p className="text-sm font-semibold text-dark-blue mb-1">{isUser ? sender?.fullName ?? "Pengguna" : "Asisten WeTrack"}</p>
      {isUser ? <p className="text-xs md:text-sm text-dark-blue/80 mb-2">{content}</p> : <div className="markdown mb-2 flex flex-col gap-2"><Markdown remarkPlugins={[remarkGfm]} components={markdownComponents} disallowedElements={["h1", "h2", "h3", "h4", "h5", "h6"]}>{content}</Markdown></div>}
      <div className="w-full flex justify-end"><p className="text-xs text-dark-blue/60">{listDateFormat(createdAt ?? null)}</p></div>
    </div>
  </div>;
}

export default memo(ChatBox);
