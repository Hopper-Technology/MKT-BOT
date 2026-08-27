import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Social credentials must be recoverable by an approved provider, so SHA-256
// (requested in the brief) is not appropriate. This uses authenticated AES-GCM
// encryption. In production, keep the 32-byte base64 key in a managed secret store.
const VERSION = "v1";

function key() {
  const value = process.env.CREDENTIAL_ENCRYPTION_KEY;
  if (!value) throw new Error("CREDENTIAL_ENCRYPTION_KEY is required");
  const decoded = Buffer.from(value, "base64");
  if (decoded.length !== 32) throw new Error("CREDENTIAL_ENCRYPTION_KEY must decode to 32 bytes");
  return decoded;
}

export function encryptCredential(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [VERSION, iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptCredential(payload: string) {
  const [version, iv, tag, encrypted] = payload.split(".");
  if (version !== VERSION || !iv || !tag || !encrypted) throw new Error("Invalid encrypted credential");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]).toString("utf8");
}
