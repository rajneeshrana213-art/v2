const LOCAL_WEB_BASE = "http://localhost:3000";
const PRODUCTION_WEB_BASE = "https://www.learnxchain.com";

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function inferWebBase() {
  if (typeof window === "undefined") {
    return process.env.NODE_ENV === "development" ? LOCAL_WEB_BASE : PRODUCTION_WEB_BASE;
  }

  if (isLocalHost(window.location.hostname)) {
    return LOCAL_WEB_BASE;
  }

  return `https://www.${window.location.hostname.replace(/^chat\./, "")}`;
}

export function getLxcWebBase() {
  const rawBase = inferWebBase().trim().replace(/\/+$/, "");

  try {
    const url = new URL(rawBase);

    const shouldUseHttps =
      typeof window !== "undefined"
        ? window.location.protocol === "https:"
        : process.env.NODE_ENV === "production";

    if (shouldUseHttps && url.protocol === "http:" && !isLocalHost(url.hostname)) {
      url.protocol = "https:";
    }

    if (url.pathname === "/api") {
      url.pathname = "";
    } else if (url.pathname.endsWith("/api")) {
      url.pathname = url.pathname.slice(0, -4);
    }

    return url.toString().replace(/\/+$/, "");
  } catch {
    return inferWebBase();
  }
}

export function lxcWebUrl(path: string) {
  return `${getLxcWebBase()}${path.startsWith("/") ? path : `/${path}`}`;
}
