import { getDb } from "../../../../db";
import { playerProfiles } from "../../../../db/schema";
import { CARD_BY_ID, RARITIES, createDefaultPlayer, type PlayerState } from "../../../game-data";
import { publicScholarId } from "../public-profile";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ scholarId: string }> }) {
  try {
    const { scholarId } = await context.params;
    if (!/^scholar-[a-z0-9]+$/.test(scholarId)) return Response.json({ error: "Scholar profile not found." }, { status: 404 });
    const rows = await getDb().select().from(playerProfiles).limit(500);
    const row = rows.find((candidate) => publicScholarId(candidate.id) === scholarId);
    if (!row) return Response.json({ error: "Scholar profile not found." }, { status: 404 });
    let state = createDefaultPlayer();
    try { state = { ...state, ...JSON.parse(row.stateJson) } as PlayerState; } catch { /* Return the safe default public card. */ }
    const topCards = Object.entries(state.ownedCards ?? {})
      .filter(([, count]) => Number(count) > 0)
      .map(([id]) => CARD_BY_ID[id])
      .filter(Boolean)
      .sort((left, right) => RARITIES.indexOf(right.rarity) - RARITIES.indexOf(left.rarity) || right.power - left.power)
      .slice(0, 3)
      .map((card) => ({ id: card.id, name: card.name, symbol: card.symbol, rarity: card.rarity, subject: card.subject, ability: card.ability }));
    return Response.json({
      scholarId,
      name: row.displayName || "Guest Scholar",
      title: state.equippedTitle || "New Scholar",
      frame: state.equippedFrame || "Archive Bronze",
      towerBest: Math.max(0, Number(state.towerBest) || 0),
      pvpRating: Math.max(0, Number(state.pvpRating) || 1000),
      topCards,
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load Scholar profile.";
    return Response.json({ error: message }, { status: 500 });
  }
}
