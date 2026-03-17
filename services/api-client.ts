const isServer = typeof window === "undefined";

const BASE_URL = isServer ? process.env.GOV_API_URL || "http://app:3003" : ""; // On client, we'll use relative path to trigger Next.js rewrites/proxy

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  token?: string;
}

export class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { params, token, ...init } = options;

    // 1. Build URL
    let url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

    // If client-side and not absolute URL, prefix with /api/proxy to hit our rewrite rule
    if (!isServer && !endpoint.startsWith("http")) {
      url = `/api/proxy${endpoint}`;
    }

    if (params) {
      const searchParams = new URLSearchParams(params);
      url += (url.includes("?") ? "&" : "?") + searchParams.toString();
    }

    // 2. Build Headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string>),
    };

    // 3. Inject Auth Token (Explicitly provided or let proxy handle it)
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...init,
      headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Unknown error" }));
      throw new Error(
        error.message || `Request failed with status ${response.status}`,
      );
    }

    return response.json();
  }

  static get<T>(
    endpoint: string,
    params?: Record<string, string>,
    options?: RequestOptions,
  ) {
    return this.request<T>(endpoint, { method: "GET", params, ...options });
  }

  static post<T>(endpoint: string, body: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    });
  }

  static patch<T>(endpoint: string, body: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    });
  }

  static delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { method: "DELETE", ...options });
  }
}
