import "server-only";

import nodemailer from "nodemailer";

function requiredEnvironment(name: "EMAIL" | "EMAIL_PASS" | "NEXTAUTH_URL"): string {
  const value = process.env[name];
  if (!value) throw new Error("Email delivery is not configured");
  return value;
}

function safeHeader(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, 120);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createInvitationLink(baseUrl: string, input: { projectId: string; teamId: string; projectName: string; senderName: string }): string {
  const url = new URL(`/invite/${encodeURIComponent(input.teamId)}`, baseUrl);
  url.searchParams.set("projectId", input.projectId);
  url.searchParams.set("projectName", input.projectName);
  url.searchParams.set("senderName", input.senderName);
  return url.toString();
}

export async function sendMail({
  email,
  senderName,
  projectId,
  teamId,
  projectName,
}: {
  email: string;
  senderName: string;
  projectId: string;
  teamId: string;
  projectName: string;
}): Promise<void> {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invitation email is invalid");

  const senderEmail = requiredEnvironment("EMAIL");
  const senderPassword = requiredEnvironment("EMAIL_PASS");
  const baseUrl = requiredEnvironment("NEXTAUTH_URL");
  const cleanSenderName = safeHeader(senderName) || "WeTrack";
  const safeProjectName = safeHeader(projectName) || "WeTrack project";
  const invitationLink = createInvitationLink(baseUrl, {
    projectId,
    teamId,
    projectName: safeProjectName,
    senderName: cleanSenderName,
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: senderEmail, pass: senderPassword },
    disableFileAccess: true,
    disableUrlAccess: true,
  });

  const escapedSenderName = escapeHtml(cleanSenderName);
  const escapedProjectName = escapeHtml(safeProjectName);
  const escapedInvitationLink = escapeHtml(invitationLink);
  try {
    await transporter.sendMail({
      from: senderEmail,
      to: email,
      subject: `Undangan WeTrack dari ${cleanSenderName}`,
      text: `${cleanSenderName} mengundang Anda bergabung dalam proyek ${safeProjectName}. Buka tautan ini: ${invitationLink}`,
      html: `<!doctype html><html lang="id"><body style="font-family:Arial,sans-serif;color:#232323"><main style="max-width:520px;margin:32px auto;padding:24px;border:1px solid #ddd;border-radius:8px"><h1 style="color:#47389f;font-size:22px">Undangan bergabung dalam WeTrack</h1><p>${escapedSenderName} mengundang Anda bergabung dengan proyek <strong>${escapedProjectName}</strong>.</p><p><a href="${escapedInvitationLink}" style="display:inline-block;padding:12px 20px;background:#47389f;border-radius:5px;color:#fff;text-decoration:none">Bergabung</a></p><p style="font-size:12px;color:#666">© WeTrack</p></main></body></html>`,
    });
  } catch {
    throw new Error("Failed to send invitation email");
  }
}
