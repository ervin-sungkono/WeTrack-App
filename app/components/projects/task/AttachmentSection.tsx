"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import Table from "../../common/table/Table";
import { onSnapshot } from "firebase/firestore";
import { dateFormat } from "@/app/lib/date";
import DotButton from "../../common/button/DotButton";
import CustomTooltip from "../../common/CustomTooltip";
import PopUpLoad from "../../common/alert/PopUpLoad";
import PopUpForm from "../../common/alert/PopUpForm";
import Button from "../../common/button/Button";
import { FiPlus as PlusIcon } from "react-icons/fi";
import { FaFileAlt as FileIcon } from "react-icons/fa";
import { MdFileDownload as DownloadIcon, MdDelete as DeleteIcon } from "react-icons/md";
import { getTaskScopedQueryReference } from "@/app/firebase/util";
import { addAttachment, deleteAttachment } from "@/app/lib/fetch/attachment";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { useRole } from "@/app/lib/context/role";
import { validateUserRole } from "@/app/lib/helper";
import { useFirebaseAuthBridge } from "@/app/components/providers/AuthProviders";
import type { Attachment } from "@/app/types/domain";

type DeleteMode = "single" | "all";
type AttachmentRow = Pick<Attachment, "id" | "taskId" | "projectId" | "originalFileName" | "createdAt">;
interface AttachmentSectionProps {
  taskId: string;
  projectId: string;
}

export default function AttachmentSection({ taskId, projectId }: AttachmentSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [deleteMode, setDeleteMode] = useState<DeleteMode | null>(null);
  const [fileFocus, setFileFocus] = useState<string | null>(null);
  const [attachmentData, setAttachmentData] = useState<AttachmentRow[]>([]);
  const role = useRole();
  const { authReady } = useFirebaseAuthBridge();
  const canEdit = validateUserRole({ userRole: role, minimumRole: "Member" });

  useEffect(() => {
    if (!taskId || !projectId || !authReady) return;
    let active = true;
    const reference = getTaskScopedQueryReference({ collectionName: "attachments", taskId, projectId });
    const unsubscribe = onSnapshot(reference, (snapshot) => {
      if (active) setAttachmentData(snapshot.docs.map((document): AttachmentRow => {
        const data = document.data();
        return {
          id: document.id,
          taskId: data.taskId,
          projectId: data.projectId,
          originalFileName: data.originalFileName,
          createdAt: data.createdAt,
        };
      }));
    }, (error) => console.error("Task attachments listener failed", error));
    return () => { active = false; unsubscribe(); };
  }, [authReady, projectId, taskId]);

  const showDeleteConfirmation = useCallback((mode: DeleteMode, id?: string) => {
    setDeleteConfirmation(true);
    setDeleteMode(mode);
    setFileFocus(mode === "single" ? id ?? null : null);
  }, []);

  const handleDeleteAttachment = async () => {
    setDeleting(true);
    try {
      if (deleteMode === "single" && fileFocus) {
        const response = await deleteAttachment({ taskId, attachmentId: fileFocus });
        if (!response.success) alert("Gagal menghapus lampiran");
      } else if (deleteMode === "all") {
        const results = await Promise.all(attachmentData.map((attachment) => deleteAttachment({ taskId, attachmentId: attachment.id })));
        if (results.some((response) => !response.success)) alert("Sebagian lampiran gagal dihapus");
      }
    } catch (error) {
      console.error("Failed to delete task attachment", error);
    } finally {
      setDeleteConfirmation(false);
      setDeleteMode(null);
      setFileFocus(null);
      setDeleting(false);
    }
  };

  const attachmentUrl = useCallback((attachmentId: string) => `/api/task/${encodeURIComponent(taskId)}/attachment/${encodeURIComponent(attachmentId)}`, [taskId]);

  const handleDownload = useCallback(async (attachmentId: string, filename: string) => {
    try {
      const response = await fetch(attachmentUrl(attachmentId));
      if (!response.ok) throw new Error(`Download failed (${response.status})`);
      saveAs(await response.blob(), filename);
    } catch (error) {
      console.error("Failed to download task attachment", error);
    }
  }, [attachmentUrl]);

  const downloadAll = useCallback(async () => {
    const zip = new JSZip();
    try {
      const files = await Promise.all(attachmentData.map(async (attachment) => {
        const response = await fetch(attachmentUrl(attachment.id));
        if (!response.ok) throw new Error(`Download failed (${response.status})`);
        return { name: attachment.originalFileName, blob: await response.blob() };
      }));
      for (const file of files) zip.file(file.name, file.blob);
      saveAs(await zip.generateAsync({ type: "blob" }), `${taskId}_attachments.zip`);
    } catch (error) {
      console.error("Failed to download all task attachments", error);
    }
  }, [attachmentData, attachmentUrl, taskId]);

  const attachmentsAction = useMemo(() => [
    { label: "Unduh Semua", fnCall: downloadAll },
    { label: "Hapus Semua", fnCall: () => showDeleteConfirmation("all") },
  ], [downloadAll, showDeleteConfirmation]);

  const columns = useMemo<ColumnDef<AttachmentRow, unknown>[]>(() => [
    { accessorKey: "id" },
    {
      accessorKey: "originalFileName",
      header: "Nama",
      cell: ({ row }) => <a href={attachmentUrl(row.original.id)} target="_blank" rel="noreferrer" className="break-words cursor-pointer text-xs md:text-sm text-basic-blue hover:underline">{row.original.originalFileName}</a>,
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal diunggah",
      cell: ({ row }) => <p className="text-xs md:text-sm">{dateFormat(row.original.createdAt ?? null, true) ?? "-"}</p>,
    },
    {
      accessorKey: "id",
      header: "Pilihan",
      enableSorting: false,
      size: 70,
      cell: ({ row }) => (
        <div className="flex gap-1">
          <CustomTooltip id={`download-file-${row.original.id}`} content="Unduh Lampiran">
            <button onClick={() => void handleDownload(row.original.id, row.original.originalFileName)} className="hover:bg-gray-200 p-1.5 rounded transition-colors duration-300">
              <DownloadIcon size={20} />
            </button>
          </CustomTooltip>
          {canEdit && <CustomTooltip id={`delete-file-${row.original.id}`} content="Hapus Lampiran">
            <button type="button" className="hover:bg-gray-200 p-1.5 rounded transition-colors duration-300" onClick={() => showDeleteConfirmation("single", row.original.id)}>
              <DeleteIcon className="text-danger-red" size={20} />
            </button>
          </CustomTooltip>}
        </div>
      ),
    },
  ], [attachmentUrl, canEdit, handleDownload, showDeleteConfirmation]);

  const openAttachmentUpload = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*,audio/*,video/*,.ppt,.pptx,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json";
    fileInput.multiple = true;
    fileInput.formEnctype = "multipart/form-data";
    fileInput.onchange = async () => {
      setUploading(true);
      try {
        const files = Array.from(fileInput.files ?? []);
        const oversized = files.filter((file) => file.size > 2 * 1024 * 1024);
        if (oversized.length) alert("Setiap lampiran harus berukuran maksimal 2MB.");
        for (const file of files.filter((item) => item.size <= 2 * 1024 * 1024)) {
          const response = await addAttachment({ taskId, attachment: file });
          if (!response.success) console.error(`Failed to upload ${file.name}`);
        }
      } catch (error) {
        console.error("Failed to upload task attachment", error);
      } finally {
        setUploading(false);
        fileInput.remove();
      }
    };
    fileInput.click();
  };

  return (
    <div className="flex flex-col gap-1 md:gap-2">
      {(uploading || isDeleting) && <PopUpLoad />}
      {deleteConfirmation && <PopUpForm title={deleteMode === "single" ? "Hapus Lampiran" : "Hapus Semua Lampiran"} message={deleteMode === "single" ? "Apakah Anda yakin ingin menghapus lampiran ini?" : "Apakah Anda yakin ingin menghapus semua lampiran dalam tugas ini?"} wrapContent>
        <div className="mt-4 flex flex-col xs:flex-row justify-end gap-2 md:gap-4">
          <Button variant="danger" onClick={handleDeleteAttachment}>Hapus</Button>
          <Button variant="secondary" onClick={() => setDeleteConfirmation(false)}>Batal</Button>
        </div>
      </PopUpForm>}
      <div className="flex items-center">
        <div className="flex flex-grow flex-col gap-1">
          <p className="font-semibold text-xs md:text-sm text-dark-blue">Lampiran <span>({attachmentData.length})</span> <span className="text-[10.8px] md:text-xs">maksimal 10</span></p>
          <p className="text-[10.8px] md:text-xs text-dark-blue/80">Batas ukuran dari satu lampiran adalah 2MB.</p>
        </div>
        {canEdit && <div className="flex gap-1">
          <DotButton name="attachments-action" actions={attachmentsAction} />
          <CustomTooltip id="attachment-tooltip" content="Tambah Lampiran">
            <button onClick={openAttachmentUpload} className="p-2 hover:bg-gray-200 duration-200 transition-colors rounded"><PlusIcon size={16} /></button>
          </CustomTooltip>
        </div>}
      </div>
      {attachmentData.length > 0 ? <div className="max-h-[400px] overflow-y-auto"><Table data={attachmentData} columns={columns} usePagination={false} /></div> : <div className="flex flex-col items-center gap-2 py-8">
        <FileIcon size={48} className="text-dark-blue/60" />
        <p className="text-xs md:text-sm text-dark-blue/80">Belum ada lampiran yang diunggah.</p>
      </div>}
    </div>
  );
}
