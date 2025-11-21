import { relations } from "drizzle-orm"
import { index } from "drizzle-orm/pg-core"
import { createTable } from "../lib/utils"
import { games } from "./games"
import { userProfiles } from "./user-profiles"

export const gameAttempts = createTable("game_attempt", (d) => ({
	id: d.uuid().primaryKey().defaultRandom(),
	gameId: d
		.uuid("game_id")
		.notNull()
		.references(() => games.id, { onDelete: "cascade" }),
	playerId: d
		.uuid("player_id")
		.notNull()
		.references(() => userProfiles.userId),
	userAnswer: d.jsonb("user_answer").$type<Record<string, unknown>>().notNull(),
	isCorrect: d.boolean("is_correct").notNull(),
	score: d.integer().notNull(),
	timeSpent: d.integer("time_spent").notNull(), // วินาที
	playedAt: d
		.timestamp("played_at", { withTimezone: true })
		.$defaultFn(() => new Date())
		.notNull(),
}), (table) => [
	index("game_attempts_player_id_idx").on(table.playerId),
	index("game_attempts_game_id_idx").on(table.gameId),
	index("game_attempts_player_id_played_at_idx").on(table.playerId, table.playedAt),
])

export const gameAttemptsRelations = relations(gameAttempts, ({ one }) => ({
	player: one(userProfiles, {
		fields: [gameAttempts.playerId],
		references: [userProfiles.id],
	}),
	game: one(games, {
		fields: [gameAttempts.gameId],
		references: [games.id],
	}),
}))

