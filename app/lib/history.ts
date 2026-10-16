export const getHistoryAction = {
  create: "membuat",
  update: "mengubah",
  delete: "menghapus",
} as const;

export const getHistoryEventType = {
  task: "Tugas",
  subtask: "Subtugas",
  taskName: "Nama Tugas",
  taskStatus: "Status Tugas",
  project: "Proyek",
  status: "Status",
  comment: "Komentar",
  attachment: "Lampiran",
  assignedTo: "Penerima",
  profile: "Profil",
  invitation: "Undangan",
} as const;

export type HistoryAction = (typeof getHistoryAction)[keyof typeof getHistoryAction];
export type HistoryEventType = (typeof getHistoryEventType)[keyof typeof getHistoryEventType];
