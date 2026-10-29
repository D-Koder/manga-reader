import { LOGIN_HASH, LOGIN_SALT, LOGIN_USERNAME } from "./loginConfig";

// Must match ITERATIONS in scripts/make-login.js.
const ITERATIONS = 210000;
const SESSION_KEY = "signedIn";

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

function bytesToHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Checks a username and password against the stored salted hash.
export async function checkCredentials(username, password) {
  if (!LOGIN_HASH || username.trim() !== LOGIN_USERNAME) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: hexToBytes(LOGIN_SALT), iterations: ITERATIONS, hash: "SHA-256" },
    key,
    256
  );
  return bytesToHex(bits) === LOGIN_HASH;
}

export function currentUsername() {
  return LOGIN_USERNAME;
}

// Stays signed in on this device until sign-out.
export function isSignedIn() {
  try {
    return localStorage.getItem(SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

export function setSignedIn(value) {
  try {
    localStorage.setItem(SESSION_KEY, String(value));
  } catch {
    // Storage blocked: the viewer will have to sign in again next visit.
  }
}
