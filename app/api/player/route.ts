import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { playerProfiles } from "../../../db/schema";
import { createDefaultPlayer, type PlayerState } from "../../game-data";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getScholarSession } from "../../scholar-auth";

export const dynamic = "force-dynamic";

type Identity = {
  id: string;
  email: string | null;
  displayName: string;
  signedIn: boolean;
  authMethod: "scholar" | "google" | null;
  scholarId?: string;
};

async function resolveIdentity(request: Request): Promise<Identity | null> {
  const scholar = await getScholarSession(request);
  if (scholar) {
    return {
      id: `scholar:${scholar.scholarId}`,
      email: null,
      displayName: scholar.displayId,
      signedIn: true,
      authMethod: "scholar",
      scholarId: scholar.displayId,
    };
  }
  const user = await getChatGPTUser();
  if (user) {
    return {
      id: `user:${user.email.toLowerCase()}`,
      email: user.email,
      displayName: user.displayName,
      signedIn: true,
      authMethod: "google",
    };
  }

  const guestId = request.headers.get("x-axiom-guest-id")?.trim() ?? "";
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(guestId)) return null;
  return { id: `guest:${guestId}`, email: null, displayName: "Guest Scholar", signedIn: false, authMethod: null };
}

function safeState(value: unknown): PlayerState | null {
  if (!value || typeof value !== "object") return null;
  const state = value as Partial<PlayerState>;
  if (
    typeof state.gems !== "number" ||
    typeof state.coins !== "number" ||
    typeof state.xp !== "number" ||
    !Array.isArray(state.deckIds) ||
    !Array.isArray(state.clearedStages) ||
    !state.settings ||
    !state.pity
  ) return null;
  return value as PlayerState;
}

function profileStats(state: PlayerState) {
  return {
    playSeconds: Math.max(0, Math.floor(state.playSeconds ?? 0)),
    chaptersCleared: Array.from({ length: 10 }, (_, index) => index + 1).filter((chapter) => state.clearedStages.includes(`c${chapter}-s6`)).length,
    pvpWins: Math.max(0, Math.floor(state.pvpWins ?? 0)),
    pvpRating: Math.max(0, Math.floor(state.pvpRating ?? 1000)),
  };
}

export async function GET(request: Request) {
  try {
    const identity = await resolveIdentity(request);
    if (!identity) return Response.json({ error: "Guest identity is missing." }, { status: 400 });

    const db = getDb();
    const rows = await db.select().from(playerProfiles).where(eq(playerProfiles.id, identity.id)).limit(1);
    let state = createDefaultPlayer();

    if (rows[0]) {
      try {
        const stored = JSON.parse(rows[0].stateJson) as Partial<PlayerState>;
        state = {
          ...state,
          ...stored,
          settings: {
            ...state.settings,
            ...(stored.settings ?? {}),
            language: stored.settings?.language === "en" ? "en" : rows[0].languagePreference === "en" ? "en" : "vi",
          },
        } as PlayerState;
      } catch {
        state = createDefaultPlayer();
      }
    } else {
      await db.insert(playerProfiles).values({
        id: identity.id,
        email: identity.email,
        displayName: identity.displayName,
        languagePreference: state.settings.language,
        stateJson: JSON.stringify(state),
        ...profileStats(state),
      });
    }

    return Response.json({
      state,
      account: { email: identity.email, displayName: identity.displayName, signedIn: identity.signedIn, authMethod: identity.authMethod, scholarId: identity.scholarId },
      sync: "live",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load player profile.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const identity = await resolveIdentity(request);
    if (!identity) return Response.json({ error: "Guest identity is missing." }, { status: 400 });

    const payload = (await request.json()) as { state?: unknown };
    const state = safeState(payload.state);
    if (!state) return Response.json({ error: "Invalid player state." }, { status: 400 });

    const serialized = JSON.stringify(state);
    if (serialized.length > 180_000) return Response.json({ error: "Player state is too large." }, { status: 413 });

    const db = getDb();
    const now = new Date().toISOString();
    const stats = profileStats(state);
    await db.insert(playerProfiles).values({
      id: identity.id,
      email: identity.email,
      displayName: identity.displayName,
      languagePreference: state.settings.language === "en" ? "en" : "vi",
      stateJson: serialized,
      ...stats,
      updatedAt: now,
    }).onConflictDoUpdate({
      target: playerProfiles.id,
      set: { email: identity.email, displayName: identity.displayName, languagePreference: state.settings.language === "en" ? "en" : "vi", stateJson: serialized, ...stats, updatedAt: now },
    });

    return Response.json({ ok: true, updatedAt: now, sync: "live" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save player profile.";
    return Response.json({ error: message }, { status: 500 });
  }
}
