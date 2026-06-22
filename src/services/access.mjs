export function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const [key, ...valueParts] = part.split("=");
      cookies[key] = decodeURIComponent(valueParts.join("=") || "");
      return cookies;
    }, {});
}

export function hasOpenAccess(request, cookieName = "open_access") {
  const cookies = parseCookies(request.headers.cookie || "");
  return cookies[cookieName] === "1";
}

export function isSafeExamBrowserRequest(request, requiredConfigKeyHash = "") {
  const userAgent = String(request.headers["user-agent"] || "").toLowerCase();
  const headerNames = Object.keys(request.headers).map((name) => name.toLowerCase());
  const sebConfigKey = String(request.headers["x-safeexambrowser-configkeyhash"] || "");
  const sebBrowserKey = String(request.headers["x-safeexambrowser-browserexamkeyhash"] || "");

  const sebDetected = (
    userAgent.includes("safeexambrowser") ||
    userAgent.includes("seb/") ||
    headerNames.some((name) => name.startsWith("x-safeexambrowser"))
  );

  if (!sebDetected) {
    return false;
  }

  if (!requiredConfigKeyHash) {
    return true;
  }

  return sebConfigKey === requiredConfigKeyHash || sebBrowserKey === requiredConfigKeyHash;
}
