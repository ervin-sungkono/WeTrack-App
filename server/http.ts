export class RequestValidationError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "RequestValidationError";
    this.status = status;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Reads a JSON object while enforcing a byte limit before parsing it. */
export async function readJsonObject(
  request: Request,
  maxBytes = 16 * 1024,
): Promise<Record<string, unknown>> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new RequestValidationError(413, "Request body is too large");
  }

  if (!request.body) throw new RequestValidationError(400, "Invalid request body");

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let byteLength = 0;
  let body = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > maxBytes) {
        await reader.cancel();
        throw new RequestValidationError(413, "Request body is too large");
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
  } finally {
    reader.releaseLock();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new RequestValidationError(400, "Invalid JSON body");
  }
  if (!isRecord(parsed)) throw new RequestValidationError(400, "Expected a JSON object");
  return parsed;
}

/** Reads multipart form data while applying the same hard byte limit to chunked bodies. */
export async function readFormData(
  request: Request,
  maxBytes = 3 * 1024 * 1024,
): Promise<FormData> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new RequestValidationError(413, "Request body is too large");
  }

  if (!request.body) throw new RequestValidationError(400, "Invalid request body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > maxBytes) {
        await reader.cancel();
        throw new RequestValidationError(413, "Request body is too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const contentType = request.headers.get("content-type");
  if (!contentType?.toLowerCase().startsWith("multipart/form-data;")) {
    throw new RequestValidationError(400, "Expected multipart form data");
  }
  try {
    return await new Response(body, { headers: { "content-type": contentType } }).formData();
  } catch {
    throw new RequestValidationError(400, "Invalid multipart form data");
  }
}

export function requiredString(
  value: unknown,
  field: string,
  maxLength: number,
  minLength = 1,
): string {
  if (typeof value !== "string") throw new RequestValidationError(400, `Invalid ${field}`);
  const normalized = value.trim();
  if (normalized.length < minLength || normalized.length > maxLength) {
    throw new RequestValidationError(400, `Invalid ${field}`);
  }
  return normalized;
}

export function genericErrorStatus(error: unknown): number {
  if (error instanceof RequestValidationError || error instanceof Error && "status" in error) {
    const status = Number((error as { status?: unknown }).status);
    if (Number.isInteger(status) && status >= 400 && status <= 499) return status;
  }
  return 500;
}

export function genericErrorMessage(error: unknown): string {
  if (error instanceof RequestValidationError) return error.message;
  const status = genericErrorStatus(error);
  if (status === 401) return "Unauthorized";
  if (status === 403) return "Forbidden";
  if (status === 404) return "Not found";
  if (status === 429) return "Too many requests";
  if (status === 413) return "Request body is too large";
  if (status === 400) return "Invalid request";
  return "Internal server error";
}
