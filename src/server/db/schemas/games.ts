import { relations } from "drizzle-orm"
import { pgEnum } from "drizzle-orm/pg-core"
import { createTable } from "../lib/utils"
import { gameAttempts } from "./game-attempts"
import { units } from "./units"

export const gameTypeEnum = pgEnum("game_type", [
	"quiz",
	"matching",
	"fill_blank",
	"multiple_choice",
])

export const gameDifficultyLevelEnum = pgEnum("game_difficulty_level", [
	"easy",
	"medium",
	"hard",
])

export const games = createTable("game", (d) => ({
	id: d.uuid().primaryKey().defaultRandom(),
	unitId: d
		.uuid("unit_id")
		.notNull()
		.references(() => units.id, { onDelete: "cascade" }),
	title: d.varchar({ length: 255 }).notNull(),
	gameType: d
		.varchar("game_type", { length: 50 })
		.$type<"quiz" | "matching" | "fill_blank" | "multiple_choice">()
		.notNull(),
	content: d.jsonb("content").$type<Record<string, unknown>>().notNull(),
	difficultyLevel: d
		.varchar("difficulty_level", { length: 50 })
		.$type<"easy" | "medium" | "hard">()
		.notNull(),
	orderIndex: d.integer("order_index").notNull(),
	createdAt: d
		.timestamp("created_at", { withTimezone: true })
		.$defaultFn(() => new Date())
		.notNull(),
}))

export const gamesRelations = relations(games, ({ one, many }) => ({
	unit: one(units, {
		fields: [games.unitId],
		references: [units.id],
	}),
	attempts: many(gameAttempts),
}))

// // Indexes for games table
// export const gamesUnitIdOrderIdx = index("games_unit_id_order_idx").on(
// 	games.unitId,
// 	games.orderIndex,
// )
// // ทำไม: Composite index สำหรับ query ที่หา games ของ unit และเรียงตาม orderIndex
// // เช่น: SELECT * FROM games WHERE unitId = ? ORDER BY orderIndex ASC
