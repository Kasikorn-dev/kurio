import { relations, sql } from "drizzle-orm"
import { index, pgPolicy } from "drizzle-orm/pg-core"
import { authenticatedRole, authUid } from "drizzle-orm/supabase"
import { createTable } from "../lib/utils"
import { games } from "./games"
import { userProfiles } from "./user-profiles"

export const gameAttempts = createTable(
	"game_attempt",
	(d) => ({
		id: d.uuid().primaryKey().defaultRandom(),
		gameId: d
			.uuid("game_id")
			.notNull()
			.references(() => games.id, { onDelete: "cascade" }),
		playerId: d
			.uuid("player_id")
			.notNull()
			.references(() => userProfiles.userId),
		userAnswer: d
			.jsonb("user_answer")
			.$type<Record<string, unknown>>()
			.notNull(),
		isCorrect: d.boolean("is_correct").notNull(),
		score: d.integer().notNull(),
		timeSpent: d.integer("time_spent").notNull(), // วินาที
		playedAt: d
			.timestamp("played_at", { withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(table) => [
		index("game_attempts_player_id_idx").on(table.playerId),
		index("game_attempts_game_id_idx").on(table.gameId),
		index("game_attempts_player_id_played_at_idx").on(
			table.playerId,
			table.playedAt,
		),

		// RLS Policies
		pgPolicy("users-select-own-attempts", {
			for: "select",
			to: authenticatedRole,
			using: sql`${authUid} = ${table.playerId}`,
		}),
		pgPolicy("users-insert-own-attempts", {
			for: "insert",
			to: authenticatedRole,
			withCheck: sql`${authUid} = ${table.playerId}`,
		}),
		// Note: No UPDATE/DELETE policies for data integrity
	],
)

export const gameAttemptsRelations = relations(gameAttempts, ({ one }) => ({
	player: one(userProfiles, {
		fields: [gameAttempts.playerId],
		references: [userProfiles.userId], // playerId references user_id, not id
	}),
	game: one(games, {
		fields: [gameAttempts.gameId],
		references: [games.id],
	}),
}))
