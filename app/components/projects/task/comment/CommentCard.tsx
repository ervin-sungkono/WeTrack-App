"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { listDateFormat } from "@/app/lib/date";
import { extractSingleMentionTag } from "@/app/lib/string";
import UserIcon from "@/app/components/common/UserIcon";
import { RiChatDeleteFill as DeleteComment } from "react-icons/ri";
import type { Comment } from "@/app/types/domain";

interface CommentCardProps {
  comment: Comment | null;
  deleteComment?: (comment: Comment) => void;
}

function getProfileImageSource(profileImage: NonNullable<Comment["user"]>["profileImage"]): string | null {
  if (typeof profileImage === "string") return profileImage;
  if (typeof profileImage === "object" && profileImage !== null && "attachmentStoragePath" in profileImage && typeof profileImage.attachmentStoragePath === "string") {
    return profileImage.attachmentStoragePath;
  }
  return null;
}

export default function CommentCard({ comment, deleteComment }: CommentCardProps) {
  const { data: session } = useSession();
  if (!session || !comment) return null;

  const renderComment = (text: string) => text.split(/(@\[[^\]]+\]\([^)]+\))/g).map((segment, index) => {
    if (!segment) return null;
    const mention = extractSingleMentionTag(segment);
    return mention.mention
      ? <Link key={`${segment}-${index}`} href={`/profile/${mention.id}`} className="text-basic-blue font-semibold hover:underline">@{mention.name}</Link>
      : <span key={`${segment}-${index}`}>{mention.content}</span>;
  });

  return (
    <div className="w-full flex gap-2 md:gap-3 pl-2 py-2">
      <UserIcon size="sm" fullName={comment.user?.fullName} src={getProfileImageSource(comment.user?.profileImage)} />
      <div className="w-full flex flex-col items-start gap-2.5">
        <div className="w-full flex flex-col gap-1">
          <div className="flex gap-2 items-center">
            <p className="text-xs md:text-sm text-dark-blue font-semibold">{comment.user?.fullName ?? "Pengguna"}</p>
            <p className="text-xs md:text-sm text-dark-blue/80">{listDateFormat(comment.createdAt ?? null)}</p>
          </div>
          <p className="text-xs md:text-sm text-dark-blue/80">{renderComment(comment.commentText)}</p>
        </div>
        {comment.userId === session.user.uid && deleteComment && <button className="flex items-center gap-2 text-danger-red hover:underline" onClick={() => deleteComment(comment)}>
          <DeleteComment size={16} /><p className="text-xs md:text-sm font-semibold">Hapus</p>
        </button>}
      </div>
    </div>
  );
}
