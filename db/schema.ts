import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const playerProfiles = sqliteTable("player_profiles", {
  id: text("id").primaryKey(),
  email: text("email"),
  displayName: text("display_name"),
  languagePreference: text("language_preference").notNull().default("vi"),
  stateJson: text("state_json").notNull(),
  playSeconds: integer("play_seconds").notNull().default(0),
  chaptersCleared: integer("chapters_cleared").notNull().default(0),
  pvpWins: integer("pvp_wins").notNull().default(0),
  pvpRating: integer("pvp_rating").notNull().default(1000),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const pvpRooms = sqliteTable("pvp_rooms", {
  code: text("code").primaryKey(),
  hostId: text("host_id").notNull(),
  hostName: text("host_name").notNull(),
  hostDeck: text("host_deck").notNull(),
  guestId: text("guest_id"),
  guestName: text("guest_name"),
  guestDeck: text("guest_deck"),
  status: text("status").notNull().default("open"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const scholarAccounts = sqliteTable("scholar_accounts", {
  scholarId: text("scholar_id").primaryKey(),
  displayId: text("display_id").notNull(),
  accessCipherHash: text("access_cipher_hash").notNull(),
  accessCipherSalt: text("access_cipher_salt").notNull(),
  cipherIterations: integer("cipher_iterations").notNull().default(180000),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: text("locked_until"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const scholarSessions = sqliteTable("scholar_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  scholarId: text("scholar_id").notNull().references(() => scholarAccounts.scholarId, { onDelete: "cascade" }),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_scholar_sessions_scholar_id").on(table.scholarId),
  index("idx_scholar_sessions_expires_at").on(table.expiresAt),
]);
