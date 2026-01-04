export function normalizeImageUrl(url?: string): string | undefined {
  if (!url) return undefined;

  let normalized = url.trim();
  if (!normalized) return undefined;

  // Replace any whitespace with URL-safe encoding
  normalized = normalized.replace(/\s+/g, "%20");

  // Handle protocol-relative URLs
  if (normalized.startsWith("//")) {
    normalized = `https:${normalized}`;
  }

  // Normalize single-slash protocol typos
  if (normalized.startsWith("http:/") && !normalized.startsWith("http://")) {
    normalized = normalized.replace("http:/", "http://");
  }

  // Prefer https when possible
  if (normalized.startsWith("http://")) {
    normalized = normalized.replace("http://", "https://");
  }

  // Tame common Amazon sizing tokens that often 404
  if (/m\.media-amazon\.com/.test(normalized)) {
    normalized = normalized.replace(/\._AC_UF\d+,\d+_QL\d+_\./, "._AC_SL1000_.");
  }

  return normalized;
}
