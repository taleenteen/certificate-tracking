// Browser-side HTTP. Talks ONLY to same-origin /api/* (the BFF proxy) — never to
// the backend directly. The proxy injects auth from httpOnly cookies, so the
// browser holds no token. Cookies ride along automatically (same-origin fetch).
//
// Usage (path is relative, no leading /api):
//   const profile = await http.get<MyProfile>("my/profile");
//   await http.post("juristic-requests", { registrationId });
//
// In React Query / Server Actions, wrap these; do not scatter raw fetch() calls.

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOpts {
  /** Pass an explicit Bearer token (e.g. tempToken for forced password change).
   *  Only used when there is no access_token cookie — the BFF proxy will use this
   *  header as-is if no cookie-sourced Authorization is present. */
  bearerToken?: string;
}

async function request<T>(method: string, path: string, body?: unknown, opts?: RequestOpts): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined && !(body instanceof FormData)) {
    headers["content-type"] = "application/json";
  }
  if (opts?.bearerToken) headers["authorization"] = `Bearer ${opts.bearerToken}`;

  const res = await fetch(`/api/${path.replace(/^\/+/, "")}`, {
    method,
    headers,
    body: body !== undefined ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => undefined) : undefined;

  if (!res.ok) {
    const message =
      (data &&
        typeof data === "object" &&
        "message" in data &&
        String((data as { message: unknown }).message)) ||
      `Request failed (${res.status})`;

    if (res.status === 403 && path !== "auth/context") {
      import("@/stores/auth").then(({ useAuthStore }) => {
        useAuthStore.getState().setAuth({ activeJuristicId: null, juristicRole: null });
      }).catch((err) => {
        console.error("Failed to import useAuthStore in ApiError handler:", err);
      });

      fetch("/api/auth/context", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ juristicId: null }),
      }).catch((err) => {
        console.error("Failed to automatically reset server-side context on 403 Forbidden:", err);
      });

      if (typeof window !== "undefined") {
        window.location.href = "/home";
      }
    }

    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

export const http = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown, opts?: RequestOpts) => request<T>("POST", path, body, opts),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
