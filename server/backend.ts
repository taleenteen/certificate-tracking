// Server-only BFF core. NEVER import this from a Client Component or any file
// that ships to the browser. The /api/[...path] proxy route is the only caller.
//
// Why a BFF: the browser never holds an access/refresh token. Tokens live in
// httpOnly cookies that JS cannot read, the backend origin stays server-side
// (no NEXT_PUBLIC_ leak, no CORS), and token refresh is centralized here.

import { cookies } from "next/headers";

/** Internal backend origin. Server-only — no NEXT_PUBLIC_ prefix, never reaches the browser. */
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:3001";

/** Cookie names the BFF owns. httpOnly → invisible to browser JS. */
export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

const isProd = process.env.NODE_ENV === "production";
const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProd,
  path: "/",
};

/** Build the upstream URL: <backend>/api/<path>?<query>. The backend mounts every route under /api. */
export function backendUrl(path: string[], search: string): string {
  return `${BACKEND_URL}/api/${path.join("/")}${search}`;
}

/** Token-bearing shape returned by login / register / tang-rat / self / refresh / context. */
interface TokenBody {
  accessToken?: unknown;
  refreshToken?: unknown;
}

/**
 * If a backend JSON body carries tokens, move them into httpOnly cookies and
 * strip them from the body so the browser never sees a raw token. One rule
 * covers every auth endpoint uniformly — no per-endpoint auth code needed.
 * Returns the sanitized body.
 */
export async function harvestTokens<T extends TokenBody>(
  body: T,
): Promise<Omit<T, "accessToken" | "refreshToken">> {
  const store = await cookies();
  if (typeof body.accessToken === "string") {
    // Cookie outliving the 15-min JWT is fine: an expired JWT → backend 401 → refresh.
    store.set(ACCESS_COOKIE, body.accessToken, { ...cookieBase, maxAge: 60 * 60 });
  }
  if (typeof body.refreshToken === "string") {
    store.set(REFRESH_COOKIE, body.refreshToken, { ...cookieBase, maxAge: 7 * 24 * 60 * 60 });
  }
  const sanitized = { ...body };
  delete sanitized.accessToken;
  delete sanitized.refreshToken;
  return sanitized;
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

/**
 * Rotate tokens once using the refresh cookie. Returns the new access token, or
 * null if there is no refresh cookie or the backend rejected it.
 */
export async function refreshTokens(): Promise<string | null> {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;

  const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  if (!res.ok) return null;

  const data = (await res.json().catch(() => null)) as TokenBody | null;
  if (!data) return null;
  await harvestTokens(data);
  return typeof data.accessToken === "string" ? data.accessToken : null;
}
