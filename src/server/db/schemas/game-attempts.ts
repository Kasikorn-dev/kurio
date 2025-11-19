import { relations } from "drizzle-orm"
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
}))

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

// // Indexes for game_attempts table
// export const gameAttemptsPlayerIdIdx = index("game_attempts_player_id_idx").on(
// 	gameAttempts.playerId,
// )
// // ทำไม: ใช้ใน WHERE clause เพื่อหา attempts ของ player - query: WHERE playerId = ?

// export const gameAttemptsGameIdIdx = index("game_attempts_game_id_idx").on(
// 	gameAttempts.gameId,
// )
// // ทำไม: ใช้ใน WHERE clause เพื่อหา attempts ของ game - query: WHERE gameId = ?

// export const gameAttemptsPlayerIdPlayedAtIdx = index(
// 	"game_attempts_player_id_played_at_idx",
// ).on(gameAttempts.playerId, gameAttempts.playedAt)
// // ทำไม: Composite index สำหรับ query ที่ดูประวัติการเล่นของ player เรียงตามเวลา
// // เช่น: SELECT * FROM game_attempts WHERE playerId = ? ORDER BY playedAt DESC
