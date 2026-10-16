"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getAllTeamMember } from "@/app/lib/fetch/team";
import { Mention, MentionsInput } from "react-mentions";
import UserIcon from "@/app/components/common/UserIcon";
import Button from "@/app/components/common/button/Button";

type MentionUser = { id: string; display: string };
interface CommentInputProps {
  projectId: string;
  onSubmit: (comment: string) => void | Promise<void>;
}

export default function CommentInput({ projectId, onSubmit }: CommentInputProps) {
  const { data: session } = useSession();
  const [comment, setComment] = useState("");
  const [focused, setFocused] = useState(false);
  const [users, setUsers] = useState<MentionUser[]>([]);

  useEffect(() => {
    let active = true;
    void getAllTeamMember({ projectId, excludeViewer: true })
      .then((response) => {
        if (!active || !response.success) return;
        setUsers((response.data ?? []).flatMap((member) => member.status === "accepted" && member.user?.fullName
          ? [{ id: member.userId, display: member.user.fullName }]
          : []));
      })
      .catch((error: unknown) => console.error("Failed to load comment mention users", error));
    return () => { active = false; };
  }, [projectId]);

  const resetComment = () => {
    setComment("");
    setFocused(false);
  };

  const submitComment = async () => {
    const value = comment.trim();
    if (!value) return;
    await onSubmit(value);
    resetComment();
  };

  return (
    <div className="flex gap-2.5 pl-2 py-2">
      <div><UserIcon fullName={session?.user.fullName} src={session?.user.profileImage?.attachmentStoragePath} alt="" size="sm" /></div>
      <div className="relative w-full flex flex-col items-end gap-1">
        <MentionsInput
          className="mentions"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Tambahkan komentar, gunakan '@' untuk menyebut pengguna lain"
          a11ySuggestionsListLabel="Suggest User Mention"
        >
          <Mention
            trigger="@"
            data={users.filter((user) => user.id !== session?.user.uid)}
            displayTransform={(_id, display) => `@${display}`}
            className="mentions__mention"
          />
        </MentionsInput>
        {focused && <div className="absolute right-0 -bottom-2 translate-y-full flex gap-1 z-50">
          <Button onClick={resetComment} variant="danger" size="sm">Batal</Button>
          <Button onClick={() => void submitComment()} size="sm" disabled={!comment.trim()}>Kirim</Button>
        </div>}
      </div>
    </div>
  );
}
