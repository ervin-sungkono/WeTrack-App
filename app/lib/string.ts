export function sanitizeName(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}

export function removeTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function generateProjectKey(projectName: string): string {
  const words = projectName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  return words.length > 1
    ? words.map((word) => word[0].toUpperCase()).join("").slice(0, 7)
    : words[0].slice(0, 2).toUpperCase();
}

export const priorityList = [
  { label: "Tidak ada", value: 0, color: "#A9A9A9" },
  { label: "Rendah", value: 1, color: "#006400" },
  { label: "Sedang", value: 2, color: "#FFBF00" },
  { label: "Tinggi", value: 3, color: "#D2222D" },
] as const;

export function getPriority(priority: number | null | undefined): (typeof priorityList)[number] | undefined {
  return priority == null ? undefined : priorityList[priority];
}

export const progressList = [
  { label: "Belum Dimulai", color: "#A9A9A9" },
  { label: "Dalam Proses", color: "#FFBF00" },
  { label: "Selesai", color: "#006400" },
  { label: "Terlambat", color: "#D2222D" },
] as const;

export function getProgress(progress: string): (typeof progressList)[number] | undefined {
  return progressList.find((item) => item.label === progress);
}

export interface MentionTag {
  name: string;
  id: string;
}

export function extractUniqueMentionTags(text: string): MentionTag[] {
  const pattern = /@\[([^[\]]+)]\(([^)]+)\)/g;
  const mentions = new Map<string, MentionTag>();
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const [, name, id] = match;
    if (!mentions.has(id)) mentions.set(id, { name, id });
  }
  return [...mentions.values()];
}

export type MentionContent = MentionTag & { mention: true } | { content: string; mention: false };

export function extractSingleMentionTag(text: string): MentionContent {
  const match = /@\[([^[\]]+)]\(([^)]+)\)/.exec(text);
  return match ? { name: match[1], id: match[2], mention: true } : { content: text, mention: false };
}
