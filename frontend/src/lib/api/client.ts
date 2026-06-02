const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

type RequestOptions = RequestInit & { json?: unknown };

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { json, headers, ...rest } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json ? JSON.stringify(json) : rest.body,
    ...rest,
  });

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = (await res.json()) as T;
    if (res.status === 401 && typeof window !== "undefined" && !path.startsWith("/auth")) {
      window.location.href = "/login";
      throw new ApiError("Unauthorized", 401);
    }
    return data;
  }

  if (!res.ok) throw new ApiError(res.statusText, res.status);
  return (await res.text()) as T;
}

export function exportUrl(path: string) {
  return `${API_BASE}${path}`;
}
