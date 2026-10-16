export interface ApiEnvelope<TData> {
  data?: TData | null;
  message?: string;
  success?: boolean;
}

export interface ApiRequestInit extends RequestInit {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function errorMessage(body: unknown, fallback: string): string {
  if (typeof body === "object" && body !== null && "message" in body) {
    const message = body.message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return fallback;
}

/** Sends a same-origin API request and preserves the endpoint's JSON envelope. */
export async function apiFetch<TResponse>(
  input: RequestInfo | URL,
  init: ApiRequestInit = {},
): Promise<TResponse> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, { ...init, headers });
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      errorMessage(body, response.statusText || "Request failed"),
      body,
    );
  }

  if (body === null || typeof body !== "object") {
    throw new ApiError(response.status, "The server returned an invalid response", body);
  }
  return body as TResponse;
}

export function jsonBody(value: unknown): string {
  return JSON.stringify(value);
}

export function encodeQuery(value: string): string {
  return encodeURIComponent(value);
}

export function parseTagValues(value: string | null | undefined): string[] | null {
  if (!value) return null;

  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) {
    throw new TypeError("Expected a serialized list of tags");
  }

  const values = parsed.flatMap((entry: unknown) => {
    if (typeof entry !== "object" || entry === null || !("value" in entry)) return [];
    const tagValue = entry.value;
    return typeof tagValue === "string" ? [tagValue] : [];
  });
  return [...new Set(values)];
}
