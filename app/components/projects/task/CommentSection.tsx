"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { addComment, deleteComment } from "@/app/lib/fetch/comment";
import EmptyState from "../../common/EmptyState";
import PopUpForm from "../../common/alert/PopUpForm";
import Button from "../../common/button/Button";
import PopUpLoad from "../../common/alert/PopUpLoad";
import { useRole } from "@/app/lib/context/role";
import { validateUserRole } from "@/app/lib/helper";
import type { Comment } from "@/app/types/domain";

const CommentInput = dynamic(() => import("./comment/CommentInput"));
const CommentCard = dynamic(() => import("./comment/CommentCard"));

interface CommentSectionProps {
  taskId: string;
  projectId: string;
  comments: Comment[] | null;
}

export default function CommentSection({ taskId, projectId, comments }: CommentSectionProps) {
  const [deleteFocus, setDeleteFocus] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(false);
  const role = useRole();

  const sendComment = async (comment: string) => {
    const response = await addComment({ text: comment, taskId });
    if (!response.success) alert("Gagal menambahkan komentar baru");
  };

  const handleDeleteComment = async () => {
    if (!deleteFocus) return;
    setLoading(true);
    try {
      const response = await deleteComment({ taskId, commentId: deleteFocus.id });
      if (!response.success) console.error("Gagal menghapus komentar");
    } catch (error) {
      console.error("Failed to delete task comment", error);
    } finally {
      setDeleteFocus(null);
      setLoading(false);
    }
  };

  if (!comments) return <div>Memuat data komentar..</div>;

  return (
    <div className="flex flex-col">
      {loading && <PopUpLoad />}
      {deleteFocus && <PopUpForm title="Hapus Komentar" message="Apakah Anda yakin ingin menghapus komentar ini?" wrapContent>
        <>
          <div className="border border-dark-blue/20 rounded"><CommentCard comment={deleteFocus} /></div>
          <div className="mt-4 flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
            <Button variant="danger" onClick={handleDeleteComment}>Hapus</Button>
            <Button variant="secondary" onClick={() => setDeleteFocus(null)}>Batal</Button>
          </div>
        </>
      </PopUpForm>}
      {validateUserRole({ userRole: role, minimumRole: "Member" }) && <CommentInput projectId={projectId} onSubmit={sendComment} />}
      {comments.length > 0 ? comments.map((comment) => <CommentCard key={comment.id} comment={comment} deleteComment={setDeleteFocus} />) : <div className="py-4 md:py-2"><EmptyState message="Belum ada komentar yang tersedia." /></div>}
    </div>
  );
}
