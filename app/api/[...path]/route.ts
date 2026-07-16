// The BFF proxy. EVERY browser → backend call flows through here under /api/*.
// Gemini does NOT write a route handler per endpoint — this catch-all forwards
// them all, injecting auth from httpOnly cookies and refreshing on 401.
//
//   browser  fetch('/api/my/profile')
//     → this route (reads access_token cookie, adds Bearer, forwards)
//       → BACKEND_INTERNAL_URL/api/my/profile
//     → on 401: refresh once via refresh_token cookie, retry, then relay
//
// Auth endpoints need no special-casing: relay() harvests any tokens out of the
// JSON body into httpOnly cookies and strips them before the body reaches JS.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ACCESS_COOKIE,
  backendUrl,
  clearAuthCookies,
  harvestTokens,
  refreshTokens,
} from "@/server/backend";

// Host/hop-by-hop headers we must not forward upstream. We strip `cookie` so our
// httpOnly auth cookies never leak to the backend — auth goes via Bearer only.
const STRIP_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "accept-encoding",
  "cookie",
]);

const STRIP_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
]);

async function proxy(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await ctx.params;
  const store = await cookies();

  // Strip framework-internal query params such as Next.js _rsc
  const queryParams = new URLSearchParams(req.nextUrl.search);
  queryParams.delete("_rsc");
  const cleanSearch = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await req.arrayBuffer();

  const call = (accessToken: string | undefined): Promise<Response> => {
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      if (!STRIP_REQUEST_HEADERS.has(key.toLowerCase())) headers.set(key, value);
    });
    if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
    return fetch(backendUrl(path, cleanSearch), {
      method: req.method,
      headers,
      body: body ? Buffer.from(body) : undefined,
      cache: "no-store",
      redirect: "manual",
    });
  };

  const isAuthPath = path[0] === "auth";
  const isTangRatLogin = path.join("/") === "auth/tang-rat";
  let upstream = await call(store.get(ACCESS_COOKIE)?.value);

  // UAT diagnostic only. Keep identity tokens and request bodies out of logs.
  // This is written to the frontend container log, which is accessible on the
  // Ubuntu server even when a Tang Rat WebView has no browser devtools.
  if (isTangRatLogin) {
    console.info("[mtoken-bff] Tang Rat exchange completed", {
      status: upstream.status,
      ok: upstream.ok,
    });
  }

  // Auto-refresh once on 401 for protected (non-auth) endpoints.
  if (upstream.status === 401 && !isAuthPath) {
    const fresh = await refreshTokens();
    if (fresh) {
      upstream = await call(fresh);
    } else {
      await clearAuthCookies();
    }
  }

  return relay(upstream, path.join("/") === "auth/logout");
}

/** Turn the upstream Response into a NextResponse, harvesting tokens out of JSON bodies. */
async function relay(upstream: Response, isLogout = false): Promise<NextResponse> {
  const headers = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) headers.set(key, value);
  });

  const contentType = upstream.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const text = await upstream.text();
    if (!text) return new NextResponse(null, { status: upstream.status, headers });

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      // Mislabeled JSON — pass through untouched.
      return new NextResponse(text, { status: upstream.status, headers });
    }

    if (
      isLogout &&
      (!payload ||
        typeof payload !== "object" ||
        Array.isArray(payload) ||
        (payload as Record<string, unknown>).logoutAllowed !== false)
    ) {
      await clearAuthCookies();
    }

    const sanitized =
      payload && typeof payload === "object" && !Array.isArray(payload)
        ? await harvestTokens(payload as Record<string, unknown>)
        : payload;
    return NextResponse.json(sanitized, { status: upstream.status, headers });
  }

  // Binary / non-JSON (rare here; presigned file downloads hit MinIO directly).
  return new NextResponse(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
