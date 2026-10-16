"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getDoc, onSnapshot } from "firebase/firestore";
import SortButton from "../../common/button/SortButton";
import { getDocumentReference, getTaskScopedQueryReference } from "@/app/firebase/util";
import { sortDateFn, sortDateTimestampFn, type SortDirection } from "@/app/lib/helper";
import { useFirebaseAuthBridge } from "@/app/components/providers/AuthProviders";
import type { Comment, HistoryEntry, UserSummary } from "@/app/types/domain";

const CommentSection = dynamic(() => import("./CommentSection"));
const HistorySection = dynamic(() => import("./HistorySection"));

type ActivityHistory = Omit<HistoryEntry, "previousValue" | "newValue"> & {
  previousValue?: string | UserSummary | null;
  newValue?: string | UserSummary | null;
};

interface ActivitySectionProps {
  taskId: string;
  projectId: string;
}

const categories = [
  { label: "Komentar", value: "comment" },
  { label: "Riwayat", value: "history" },
] as const;

export default function ActivitySection({ taskId, projectId }: ActivitySectionProps) {
  const [category, setCategory] = useState<"comment" | "history">("comment");
  const [commentData, setCommentData] = useState<Comment[] | null>(null);
  const [historyData, setHistoryData] = useState<ActivityHistory[] | null>(null);
  const [sorting, setSorting] = useState<SortDirection>("asc");
  const { authReady } = useFirebaseAuthBridge();

  useEffect(() => {
    if (!taskId || !projectId || !authReady) return;
    let active = true;

    const commentsQuery = getTaskScopedQueryReference({ collectionName: "comments", taskId, projectId });
    const unsubscribeComments = onSnapshot(commentsQuery, async (snapshot) => {
      try {
        const comments = await Promise.all(snapshot.docs.map(async (document): Promise<Comment> => {
          const data = document.data();
          let user: UserSummary | null = null;
          if (data.userId) {
            const userSnapshot = await getDoc(getDocumentReference({ collectionName: "users", id: data.userId }));
            if (userSnapshot.exists()) {
              const profile = userSnapshot.data();
              user = { id: userSnapshot.id, fullName: profile.fullName, profileImage: profile.profileImage };
            }
          }
          return { ...data, id: document.id, user };
        }));
        if (active) setCommentData(comments);
      } catch (error) {
        console.error("Failed to load task comments", error);
      }
    }, (error) => console.error("Task comments listener failed", error));

    const historiesQuery = getTaskScopedQueryReference({ collectionName: "histories", taskId, projectId });
    const unsubscribeHistories = onSnapshot(historiesQuery, (snapshot) => {
      if (!active) return;
      setHistoryData(snapshot.docs.map((document) => ({ ...document.data(), id: document.id })) as ActivityHistory[]);
    }, (error) => console.error("Task history listener failed", error));

    return () => {
      active = false;
      unsubscribeComments();
      unsubscribeHistories();
    };
  }, [authReady, projectId, taskId]);

  const visibleActivity = category === "comment"
    ? <CommentSection taskId={taskId} projectId={projectId} comments={commentData && sortDateFn({ data: commentData, sortDirection: sorting })} />
    : <HistorySection histories={historyData && sortDateTimestampFn({ data: historyData, sortDirection: sorting })} />;

  return (
    <div className="flex flex-col gap-2 md:gap-4 min-h-[240px]">
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-xs md:text-sm flex-grow">Aktivitas</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <p className="hidden xs:block text-xs md:text-sm">Tampilkan:</p>
            <div className="flex gap-2">
              {categories.map(({ label, value }) => (
                <button
                  key={value}
                  className={`font-medium text-xs rounded py-1 px-2 ${category === value ? "bg-light-blue" : "bg-gray-200 hover:bg-light-blue"} text-dark-blue transition-colors duration-300`}
                  onClick={() => setCategory(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <SortButton sorting={sorting} setSorting={setSorting} />
        </div>
      </div>
      {visibleActivity}
    </div>
  );
}
