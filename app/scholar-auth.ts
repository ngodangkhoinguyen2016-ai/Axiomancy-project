import { and, eq, gt, lt } from "drizzle-orm";
import { getDb } from "../db";
import { scholarAccounts, scholarSessions } from "../db/schema";

const SESSION_COOKIE = "__Host-axiom_scholar_session";
const SESSION_DAYS = 30;
export const CIPHER_ITERATIONS = 180_000;

export type ScholarSession = { scholarId: string; displayId: string };

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(value: string) {
  if (!/^[0-9a-f]+$/i.test(value) || value.length % 2 !== 0) return null;
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.length; index += 1) bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  return bytes;
}

async function sha256(value: string) {
  return bytesToHex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));
}

export function normalizeScholarId(value: string) {
  return value.trim().toLowerCase();
}

export function validScholarId(value: string) {
  return /^[a-zA-Z][a-zA-Z0-9_-]{3,23}$/.test(value.trim());
}

export function validAccessCipher(value: string) {
  return value.length >= 8 && value.length <= 72 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);
}

export async function hashAccessCipher(cipher: string, salt?: Uint8Array, iterations = CIPHER_ITERATIONS) {
  const actualSalt = salt ? new Uint8Array(salt) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(cipher), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: actualSalt, iterations }, key, 256);
  return { hash: bytesToHex(new Uint8Array(bits)), salt: bytesToHex(actualSalt), iterations };
}

export async function verifyAccessCipher(cipher: string, expectedHash: string, saltHex: string, iterations: number) {
  const salt = hexToBytes(saltHex);
  const expected = hexToBytes(expectedHash);
  if (!salt || !expected) return false;
  const actual = hexToBytes((await hashAccessCipher(cipher, salt, iterations)).hash);
  if (!actual || actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) difference |= actual[index] ^ expected[index];
  return difference === 0;
}

function readCookie(request: Request, name: string) {
  const raw = request.headers.get("cookie") ?? "";
  for (const pair of raw.split(";")) {
    const separator = pair.indexOf("=");
    if (separator < 0 || pair.slice(0, separator).trim() !== name) continue;
    try { return decodeURIComponent(pair.slice(separator + 1).trim()); } catch { return ""; }
  }
  return "";
}

export async function getScholarSession(request: Request): Promise<ScholarSession | null> {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token || !/^[A-Za-z0-9_-]{40,80}$/.test(token)) return null;
  const tokenHash = await sha256(token);
  const now = new Date().toISOString();
  const db = getDb();
  const rows = await db.select({ scholarId: scholarAccounts.scholarId, displayId: scholarAccounts.displayId })
    .from(scholarSessions)
    .innerJoin(scholarAccounts, eq(scholarSessions.scholarId, scholarAccounts.scholarId))
    .where(and(eq(scholarSessions.tokenHash, tokenHash), gt(scholarSessions.expiresAt, now)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createScholarSession(scholarId: string) {
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const token = bytesToHex(tokenBytes);
  const tokenHash = await sha256(token);
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const db = getDb();
  await db.delete(scholarSessions).where(lt(scholarSessions.expiresAt, new Date().toISOString()));
  await db.insert(scholarSessions).values({ tokenHash, scholarId, expiresAt: expires.toISOString() });
  return { token, cookie: `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 24 * 60 * 60}` };
}

export async function deleteScholarSession(request: Request) {
  const token = readCookie(request, SESSION_COOKIE);
  if (token) await getDb().delete(scholarSessions).where(eq(scholarSessions.tokenHash, await sha256(token)));
}

export function clearScholarSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
