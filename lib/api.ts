import { revalidatePath } from "next/cache";

const LARAVEL_API_URL = process.env.LARAVEL_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`API request failed with status ${status}`);
    this.status = status;
    this.body = body;
  }
}

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string;
  revalidate?: number;
  ip?: string;
};

export function clientIp(request: Request): string | undefined {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
}

// Last good answer per URL, used when the API is down. Per server instance, capped.
const lastGood = new Map<string, unknown>();
const LAST_GOOD_MAX = 200;

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, body, headers, revalidate, ip, ...rest } = options;
  const method = (rest.method ?? "GET").toUpperCase();
  const cacheable = method === "GET" && revalidate !== undefined;

  let res: Response;
  try {
    res = await fetch(`${LARAVEL_API_URL}/api${path}`, {
      ...rest,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(ip ? { "X-Client-IP": ip } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...(cacheable ? { next: { revalidate } } : { cache: "no-store" as const }),
    });
  } catch (err) {
    if (cacheable && lastGood.has(path)) return lastGood.get(path) as T;
    throw err;
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    if (cacheable && res.status >= 500 && lastGood.has(path)) return lastGood.get(path) as T;
    throw new ApiError(res.status, data);
  }

  if (cacheable) {
    if (lastGood.size >= LAST_GOOD_MAX) lastGood.delete(lastGood.keys().next().value as string);
    lastGood.set(path, data);
  }

  // An admin changed something → public pages must not keep showing the cached copy.
  if (method !== "GET" && token && !path.startsWith("/enquiries")) {
    revalidatePath("/", "layout");
  }

  return data as T;
}
