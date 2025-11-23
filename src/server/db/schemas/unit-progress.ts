import { relations, sql } from "drizzle-orm"
import { index, pgPolicy, uniqueIndex } from "drizzle-orm/pg-core"
import { authenticatedRole, authUid } from "drizzle-orm/supabase"
import { createTable } from "../lib/utils"
import { units } from "./units"
import { userProfiles } from "./user-profiles"

export const unitProgress = createTable(
	"unit_progress",
	(d) => ({
		id: d.uuid().primaryKey().defaultRandom(),
		unitId: d
			.uuid("unit_id")
			.notNull()
			.references(() => units.id, { onDelete: "cascade" }),
		playerId: d
			.uuid("player_id")
			.notNull()
			.references(() => userProfiles.userId),
		completedGames: d.integer("completed_games").default(0).notNull(),
		totalGames: d.integer("total_games").notNull(),
		isCompleted: d.boolean("is_completed").default(false).notNull(),
		lastPlayedAt: d.timestamp("last_played_at", { withTimezone: true }),
		createdAt: d
			.timestamp("created_at", { withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d
			.timestamp("updated_at", { withTimezone: true })
			.$onUpdate(() => new Date()),
	}),
	(table) => [
		uniqueIndex("unit_progress_player_id_unit_id_idx").on(
			table.playerId,
			table.unitId,
		),
		index("unit_progress_player_id_idx").on(table.playerId),
		index("unit_progress_unit_id_idx").on(table.unitId),
		index("unit_progress_player_id_completed_idx").on(
			table.playerId,
			table.isCompleted,
		),

		// RLS Policies
		pgPolicy("users-select-own-progress", {
			for: "select",
			to: authenticatedRole,
			using: sql`${authUid} = ${table.playerId}`,
		}),
		pgPolicy("users-insert-own-progress", {
			for: "insert",
			to: authenticatedRole,
			withCheck: sql`${authUid} = ${table.playerId}`,
		}),
		pgPolicy("users-update-own-progress", {
			for: "update",
			to: authenticatedRole,
			using: sql`${authUid} = ${table.playerId}`,
			withCheck: sql`${authUid} = ${table.playerId}`,
		}),
		pgPolicy("users-delete-own-progress", {
			for: "delete",
			to: authenticatedRole,
			using: sql`${authUid} = ${table.playerId}`,
		}),
	],
)

export const unitProgressRelations = relations(unitProgress, ({ one }) => ({
	player: one(userProfiles, {
		fields: [unitProgress.playerId],
		references: [userProfiles.id],
	}),
	unit: one(units, {
		fields: [unitProgress.unitId],
		references: [units.id],
	}),
}))
