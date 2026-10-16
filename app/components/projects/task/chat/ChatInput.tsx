"use client";

import { useState, type FormEvent } from "react";
import { onExpandableTextareaInput } from "@/app/lib/textarea-expandable";
import CustomTooltip from "@/app/components/common/CustomTooltip";
import { IoMdSend as SendIcon } from "react-icons/io";
import { useRole } from "@/app/lib/context/role";
import { validateUserRole } from "@/app/lib/helper";

interface ChatInputProps {
  name: string;
  onSubmit: (content: string) => void | Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}

export default function ChatInput({ name, onSubmit, placeholder, disabled = false }: ChatInputProps) {
  const [text, setText] = useState("");
  const role = useRole();

  if (!validateUserRole({ userRole: role, minimumRole: "Member" })) {
    return <div className="absolute bottom-0 left-0 w-full text-center text-dark-blue/80 text-xs md:text-sm py-2">Obrolan ini hanya dapat dibaca karena peran Anda dalam proyek ini adalah <b>Viewer</b>.</div>;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = text.trim();
    if (!content || disabled) return;
    await onSubmit(content);
    setText("");
  };

  return <div className="absolute bottom-0 left-0 w-full flex gap-4 items-center">
    <form onSubmit={(event) => void handleSubmit(event)} className="w-full flex gap-1">
      <div className="relative w-full flex items-end py-3 md:py-4 pl-4 pr-12 bg-white rounded-md shadow-md border border-dark-blue/30 focus-within:border-basic-blue/60">
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          value={text}
          disabled={disabled}
          maxLength={1000}
          rows={1}
          data-min-rows="1"
          className="auto_expand bg-transparent w-full p-0 border-none focus:ring-0 resize-none h-auto md:max-h-[200px] text-xs md:text-sm"
          onChange={(event) => setText(event.target.value)}
          onInput={(event) => onExpandableTextareaInput(event.nativeEvent)}
          onKeyDown={(event) => {
            if (!disabled && event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          autoFocus
        />
        <div className="absolute right-2 md:right-3 bottom-1.5 md:bottom-3">
          <CustomTooltip id={`${name}-submit-tooltip`} content="Kirim Pesan">
            <button type="submit" className="p-2 disabled:bg-gray-400 text-white bg-basic-blue rounded transition-colors duration-200" disabled={disabled || text.trim() === ""}>
              <SendIcon size={16} />
            </button>
          </CustomTooltip>
        </div>
      </div>
    </form>
  </div>;
}
