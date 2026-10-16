import type { ApiEnvelope } from "@/app/lib/fetch/http";
import { apiFetch, encodeQuery, jsonBody } from "@/app/lib/fetch/http";
import type { AuthUser, ProfileDetails } from "@/app/types/auth";
import type { EntityId, HistoryEntry, Notification } from "@/app/types/domain";

export interface CurrentUserProfile extends ProfileDetails {
  uid: EntityId;
  email: string;
}

export function signIn({ email, password }: { email: string; password: string }): Promise<ApiEnvelope<AuthUser>> {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: jsonBody({ email, password }),
  });
}

export function signUp(credentials: { email: string; password: string; fullName: string }): Promise<ApiEnvelope<AuthUser>> {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: jsonBody(credentials),
  });
}

export function resetUserPassword(email: string | { email: string }): Promise<ApiEnvelope<null>> {
  return apiFetch("/api/auth/user/reset-password", {
    method: "POST",
    body: jsonBody(typeof email === "string" ? { email } : email),
  });
}

export function changeUserPassword({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }): Promise<ApiEnvelope<null>> {
  return apiFetch("/api/auth/user/change-password", {
    method: "POST",
    body: jsonBody({ oldPassword, newPassword }),
  });
}

export function getUserProfile(): Promise<ApiEnvelope<CurrentUserProfile>> {
  return apiFetch("/api/auth/user");
}

export function getUserProfileById(profileId: EntityId): Promise<ApiEnvelope<ProfileDetails & { id: EntityId }>> {
  return apiFetch(`/api/user/${encodeURIComponent(profileId)}`);
}

export function updateUserProfile(formData: FormData): Promise<ApiEnvelope<CurrentUserProfile>> {
  return apiFetch("/api/auth/user", {
    method: "PUT",
    body: formData,
  });
}

export function deleteUserImageProfile(): Promise<ApiEnvelope<null>> {
  return apiFetch("/api/auth/user/profile-picture", { method: "DELETE" });
}

export function deleteUserProfile({ password }: { password: string }): Promise<ApiEnvelope<null>> {
  return apiFetch("/api/auth/user", {
    method: "DELETE",
    body: jsonBody({ password }),
  });
}

export function getUserHistory(): Promise<ApiEnvelope<HistoryEntry[]>> {
  return apiFetch("/api/history");
}

export function getUserTaskHistory({ taskId }: { taskId: EntityId }): Promise<ApiEnvelope<HistoryEntry[]>> {
  return apiFetch(`/api/history?taskId=${encodeQuery(taskId)}`);
}

export function getUserNotification(): Promise<ApiEnvelope<Notification[]>> {
  return apiFetch("/api/notification");
}
