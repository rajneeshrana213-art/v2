const B64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/**
 * Encodes a database ID to a URL-safe base64url string.
 * Pure JS implementation — no Buffer, no btoa — works in browser, Node.js, and Turbopack.
 */
export function encodeId(id: string): string {
  if (id === null || id === undefined || id === "") return id;
  let result = "";
  for (let i = 0; i < id.length; i += 3) {
    const b0 = id.charCodeAt(i);
    const b1 = i + 1 < id.length ? id.charCodeAt(i + 1) : 0;
    const b2 = i + 2 < id.length ? id.charCodeAt(i + 2) : 0;
    result += B64_CHARS[b0 >> 2];
    result += B64_CHARS[((b0 & 3) << 4) | (b1 >> 4)];
    result += B64_CHARS[((b1 & 15) << 2) | (b2 >> 6)];
    result += B64_CHARS[b2 & 63];
  }
  const rem = id.length % 3;
  if (rem === 1) return result.slice(0, -2);
  if (rem === 2) return result.slice(0, -1);
  return result;
}

/**
 * Decodes a URL-safe base64url encoded ID back to the original database ID.
 * Returns the input as-is if decoding fails (backward compatibility).
 */
export function decodeId(encoded: string): string {
  if (encoded === null || encoded === undefined || encoded === "")
    return encoded;
  try {
    const lookup: Record<string, number> = {};
    for (let i = 0; i < B64_CHARS.length; i++) lookup[B64_CHARS[i]] = i;
    let result = "";
    for (let i = 0; i < encoded.length; i += 4) {
      const e0 = lookup[encoded[i]] ?? 0;
      const e1 = lookup[encoded[i + 1]] ?? 0;
      const e2 = lookup[encoded[i + 2]] ?? 0;
      const e3 = lookup[encoded[i + 3]] ?? 0;
      result += String.fromCharCode((e0 << 2) | (e1 >> 4));
      if (encoded[i + 2] !== undefined)
        result += String.fromCharCode(((e1 & 15) << 4) | (e2 >> 2));
      if (encoded[i + 3] !== undefined)
        result += String.fromCharCode(((e2 & 3) << 6) | e3);
    }
    return result;
  } catch {
    return encoded;
  }
}
