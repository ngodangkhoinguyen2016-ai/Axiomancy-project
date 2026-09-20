import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { playerProfiles, scholarAccounts } from "../../../../db/schema";
import { createDefaultPlayer } from "../../../game-data";
import {
  clearScholarSessionCookie, createScholarSession, deleteScholarSession, hashAccessCipher,
  normalizeScholarId, validAccessCipher, validScholarId, verifyAccessCipher,
} from "../../../scholar-auth";

export const dynamic = "force-dynamic";

function profileStats() {
  return { playSeconds: 0, chaptersCleared: 0, pvpWins: 0, pvpRating: 1000 };
}

function json(body: object, status = 200, cookie?: string) {
  const headers = new Headers({ "content-type": "application/json", "cache-control": "no-store" });
  if (cookie) headers.append("set-cookie", cookie);
  return new Response(JSON.stringify(body), { status, headers });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { action?: string; scholarId?: string; accessCipher?: string };
    if (payload.action === "logout") {
      await deleteScholarSession(request);
      return json({ ok: true }, 200, clearScholarSessionCookie());
    }

    const displayId = payload.scholarId?.trim() ?? "";
    const accessCipher = payload.accessCipher ?? "";
    if (!validScholarId(displayId)) return json({ error: "Scholar ID must start with a letter and contain 4–24 letters, numbers, underscores, or hyphens." }, 400);
    if (!validAccessCipher(accessCipher)) return json({ error: "Access Cipher must contain 8–72 characters with at least one letter and one number." }, 400);

    const scholarId = normalizeScholarId(displayId);
    const db = getDb();
    const [existing] = await db.select().from(scholarAccounts).where(eq(scholarAccounts.scholarId, scholarId)).limit(1);

    if (payload.action === "signup") {
      if (existing) return json({ error: "That Scholar ID is unavailable." }, 409);
      const cipher = await hashAccessCipher(accessCipher);
      const state = createDefaultPlayer();
      const now = new Date().toISOString();
      await db.insert(scholarAccounts).values({ scholarId, displayId, accessCipherHash: cipher.hash, accessCipherSalt: cipher.salt, cipherIterations: cipher.iterations, updatedAt: now });
      await db.insert(playerProfiles).values({ id: `scholar:${scholarId}`, email: null, displayName: displayId, stateJson: JSON.stringify(state), ...profileStats(), updatedAt: now });
      const session = await createScholarSession(scholarId);
      return json({ ok: true, account: { signedIn: true, authMethod: "scholar", scholarId: displayId, displayName: displayId, email: null }, initialState: { level: 0, gems: 0, coins: 0, skillPoints: 0, deckSize: state.deckIds.length } }, 201, session.cookie);
    }

    if (payload.action !== "login") return json({ error: "Unsupported authentication action." }, 400);
    if (!existing) return json({ error: "Scholar ID or Access Cipher is incorrect." }, 401);

    const lockedUntil = existing.lockedUntil ? Date.parse(existing.lockedUntil) : 0;
    if (lockedUntil > Date.now()) return json({ error: "Too many attempts. Try again in a few minutes." }, 429);
    const matches = await verifyAccessCipher(accessCipher, existing.accessCipherHash, existing.accessCipherSalt, existing.cipherIterations);
    if (!matches) {
      const failedAttempts = existing.failedAttempts + 1;
      const lock = failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
      await db.update(scholarAccounts).set({ failedAttempts: lock ? 0 : failedAttempts, lockedUntil: lock, updatedAt: new Date().toISOString() }).where(eq(scholarAccounts.scholarId, scholarId));
      return json({ error: lock ? "Too many attempts. Try again in 15 minutes." : "Scholar ID or Access Cipher is incorrect." }, lock ? 429 : 401);
    }

    await db.update(scholarAccounts).set({ failedAttempts: 0, lockedUntil: null, updatedAt: new Date().toISOString() }).where(eq(scholarAccounts.scholarId, scholarId));
    const session = await createScholarSession(scholarId);
    return json({ ok: true, account: { signedIn: true, authMethod: "scholar", scholarId: existing.displayId, displayName: existing.displayId, email: null } }, 200, session.cookie);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authentication is temporarily unavailable.";
    const duplicate = /unique|constraint/i.test(message);
    return json({ error: duplicate ? "That Scholar ID is unavailable." : "Authentication is temporarily unavailable." }, duplicate ? 409 : 500);
  }
}
