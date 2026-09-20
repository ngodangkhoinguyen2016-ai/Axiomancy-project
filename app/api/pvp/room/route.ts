import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { pvpRooms } from "../../../../db/schema";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { getScholarSession } from "../../../scholar-auth";
import { CARD_BY_ID, DECK_SIZE, validateDeck } from "../../../game-data";

export const dynamic = "force-dynamic";

type Identity = { id: string; displayName: string };

async function resolveIdentity(request: Request): Promise<Identity | null> {
  const scholar = await getScholarSession(request);
  if (scholar) return { id: `scholar:${scholar.scholarId}`, displayName: scholar.displayId };
  const user = await getChatGPTUser();
  if (user) return { id: `user:${user.email.toLowerCase()}`, displayName: user.displayName };
  const guestId = request.headers.get("x-axiom-guest-id")?.trim() ?? "";
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(guestId)) return null;
  return { id: `guest:${guestId}`, displayName: "Guest Scholar" };
}

function cleanDeck(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && Boolean(CARD_BY_ID[item])).slice(0, DECK_SIZE);
}

function isLegalDeck(deck: string[]) {
  return validateDeck(deck).valid;
}

function roomPayload(room: typeof pvpRooms.$inferSelect, identity?: Identity | null) {
  return {
    code: room.code,
    status: room.status,
    hostName: room.hostName,
    guestName: room.guestName,
    hostDeck: JSON.parse(room.hostDeck) as string[],
    guestDeck: room.guestDeck ? JSON.parse(room.guestDeck) as string[] : null,
    role: identity ? room.hostId === identity.id ? "host" : room.guestId === identity.id ? "guest" : "spectator" : "spectator",
  };
}

function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = new Uint8Array(6);
  crypto.getRandomValues(values);
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
}

export async function GET(request: Request) {
  try {
    const identity = await resolveIdentity(request);
    const code = new URL(request.url).searchParams.get("code")?.trim().toUpperCase() ?? "";
    if (!/^[A-Z2-9]{6}$/.test(code)) return Response.json({ error: "Enter a valid 6-character room code." }, { status: 400 });
    const [room] = await getDb().select().from(pvpRooms).where(eq(pvpRooms.code, code)).limit(1);
    if (!room) return Response.json({ error: "Room not found." }, { status: 404 });
    return Response.json({ room: roomPayload(room, identity) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read the room.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const identity = await resolveIdentity(request);
    if (!identity) return Response.json({ error: "Guest identity is missing." }, { status: 400 });
    const payload = await request.json() as { action?: string; code?: string; deckIds?: unknown };
    const deck = cleanDeck(payload.deckIds);
    if (!isLegalDeck(deck)) return Response.json({ error: "A legal 16-card deck is required, including at least 8 Base cards and the configured rarity limits." }, { status: 400 });
    const db = getDb();

    if (payload.action === "create") {
      let code = "";
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const candidate = makeCode();
        const [existing] = await db.select({ code: pvpRooms.code }).from(pvpRooms).where(eq(pvpRooms.code, candidate)).limit(1);
        if (!existing) { code = candidate; break; }
      }
      if (!code) return Response.json({ error: "Could not allocate a room code. Try again." }, { status: 503 });
      await db.insert(pvpRooms).values({ code, hostId: identity.id, hostName: identity.displayName, hostDeck: JSON.stringify(deck) });
      const [room] = await db.select().from(pvpRooms).where(eq(pvpRooms.code, code)).limit(1);
      return Response.json({ room: roomPayload(room, identity) }, { status: 201 });
    }

    if (payload.action === "join") {
      const code = payload.code?.trim().toUpperCase() ?? "";
      if (!/^[A-Z2-9]{6}$/.test(code)) return Response.json({ error: "Enter a valid 6-character room code." }, { status: 400 });
      const [room] = await db.select().from(pvpRooms).where(eq(pvpRooms.code, code)).limit(1);
      if (!room) return Response.json({ error: "Room not found." }, { status: 404 });
      if (room.hostId === identity.id) return Response.json({ room: roomPayload(room, identity) });
      if (room.guestId && room.guestId !== identity.id) return Response.json({ error: "This room is already full." }, { status: 409 });
      const now = new Date().toISOString();
      await db.update(pvpRooms).set({ guestId: identity.id, guestName: identity.displayName, guestDeck: JSON.stringify(deck), status: "matched", updatedAt: now }).where(eq(pvpRooms.code, code));
      const [joined] = await db.select().from(pvpRooms).where(eq(pvpRooms.code, code)).limit(1);
      return Response.json({ room: roomPayload(joined, identity) });
    }

    return Response.json({ error: "Unsupported room action." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update the room.";
    return Response.json({ error: message }, { status: 500 });
  }
}
