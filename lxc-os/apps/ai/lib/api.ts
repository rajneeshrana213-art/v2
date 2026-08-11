import { lxcWebUrl } from "./lxc-api-base";

export async function apiRequest(path: string, options: RequestInit = {}) {
  const url = lxcWebUrl(`/api${path.startsWith("/") ? path : `/${path}`}`);

  // Retrieve token from storage (using the key defined in auth-context)
  const token = typeof window !== "undefined" ? localStorage.getItem("@lxc_ai_token") : null;

  // Enforce session cookie sharing across different local ports
  options.credentials = "include";
  options.headers = {
    "Accept": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, options);

    if (response.status === 401 || response.status === 403) {
      if (typeof window !== "undefined") {
        // Redirect to local login on port 5000
        window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.origin)}`;
      }
      throw new Error("Unauthorized access. Redirecting...");
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {
        // ignore
      }
      const message = errorJson?.error || errorJson?.message || `HTTP error ${response.status}`;
      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error: any) {
    console.error(`[API Client Error] URL: ${url}`, error);
    throw error;
  }
}

export const client = {
  get: (path: string, options?: RequestInit) => apiRequest(path, { ...options, method: "GET" }),
  post: (path: string, body?: any, options?: RequestInit) => apiRequest(path, {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(body)
  }),
  put: (path: string, body?: any, options?: RequestInit) => apiRequest(path, {
    ...options,
    method: "PUT",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(body)
  }),
  delete: (path: string, options?: RequestInit) => apiRequest(path, { ...options, method: "DELETE" }),
};
