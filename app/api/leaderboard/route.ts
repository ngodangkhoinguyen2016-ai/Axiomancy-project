import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { playerProfiles } from "../../../db/schema";
import { publicScholarId } from "../scholar/public-profile";

export const dynamic = "force-dynamic";

type PublicPlayer = {
  scholarId: string;
  name: string;
  title: string;
  playSeconds: number;
  chaptersCleared: number;
  pvpWins: number;
  pvpRating: number;
  towerBest: number;
  score: number;
};

function publicPlayer(row: typeof playerProfiles.$inferSelect): PublicPlayer {
  let title = "New Scholar";
  let towerBest = 0;
  try {
    const state = JSON.parse(row.stateJson) as { equippedTitle?: string; towerBest?: number };
    title = state.equippedTitle || title;
    towerBest = Math.max(0, Number(state.towerBest) || 0);
  } catch {
    // Older profiles remain rankable with their normalized columns.
  }
  const playSeconds = row.playSeconds ?? 0;
  const chaptersCleared = row.chaptersCleared ?? 0;
  const pvpWins = row.pvpWins ?? 0;
  const pvpRating = row.pvpRating ?? 1000;
  return {
    scholarId: publicScholarId(row.id),
    name: row.displayName || "Guest Scholar",
    title,
    playSeconds,
    chaptersCleared,
    pvpWins,
    pvpRating,
    towerBest,
    score: Math.round(playSeconds / 60 + chaptersCleared * 500 + pvpWins * 120 + Math.max(0, pvpRating - 900) + towerBest * 80),
  };
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(playerProfiles).orderBy(desc(playerProfiles.updatedAt)).limit(100);
    const players = rows.map(publicPlayer);
    const rank = (key: keyof Pick<PublicPlayer, "score" | "playSeconds" | "chaptersCleared" | "pvpWins" | "pvpRating">) =>
      [...players].sort((left, right) => right[key] - left[key]).slice(0, 25);
    const overall = rank("score").map((player, index) => index === 1 || index === 2 ? { ...player, title: "The Triumvirate" } : player);
    return Response.json({
      overall,
      playtime: rank("playSeconds"),
      chapters: rank("chaptersCleared"),
      pvp: rank("pvpRating"),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load rankings.";
    return Response.json({ error: message }, { status: 500 });
  }
}
