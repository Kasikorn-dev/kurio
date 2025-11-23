import { relations, sql } from "drizzle-orm"
import { index, pgEnum, pgPolicy } from "drizzle-orm/pg-core"
import { authenticatedRole, authUid } from "drizzle-orm/supabase"
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
}), (table) => [
	index("games_unit_id_order_idx").on(table.unitId, table.orderIndex),
	
	// RLS Policies - Inherit from parent kurio (via unit)
	pgPolicy("users-select-own-games", {
		for: "select",
		to: authenticatedRole,
		using: sql`EXISTS (
			SELECT 1 FROM units
			JOIN kurios ON kurios.id = units.kurio_id
			WHERE units.id = ${table.unitId}
			AND kurios.user_id = ${authUid}
		)`,
	}),
	pgPolicy("users-insert-own-games", {
		for: "insert",
		to: authenticatedRole,
		withCheck: sql`EXISTS (
			SELECT 1 FROM units
			JOIN kurios ON kurios.id = units.kurio_id
			WHERE units.id = ${table.unitId}
			AND kurios.user_id = ${authUid}
		)`,
	}),
	pgPolicy("users-update-own-games", {
		for: "update",
		to: authenticatedRole,
		using: sql`EXISTS (
			SELECT 1 FROM units
			JOIN kurios ON kurios.id = units.kurio_id
			WHERE units.id = ${table.unitId}
			AND kurios.user_id = ${authUid}
		)`,
	}),
	pgPolicy("users-delete-own-games", {
		for: "delete",
		to: authenticatedRole,
		using: sql`EXISTS (
			SELECT 1 FROM units
			JOIN kurios ON kurios.id = units.kurio_id
			WHERE units.id = ${table.unitId}
			AND kurios.user_id = ${authUid}
		)`,
	}),
])

export const gamesRelations = relations(games, ({ one, many }) => ({
	unit: one(units, {
		fields: [games.unitId],
		references: [units.id],
	}),
	attempts: many(gameAttempts),
}))

