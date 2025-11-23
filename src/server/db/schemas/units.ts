import { relations, sql } from "drizzle-orm"
import { index, pgPolicy } from "drizzle-orm/pg-core"
import { authenticatedRole, authUid } from "drizzle-orm/supabase"
import { createTable } from "../lib/utils"
import { games } from "./games"
import { kurios } from "./kurios"
import { unitProgress } from "./unit-progress"

export const units = createTable("unit", (d) => ({
	id: d.uuid().primaryKey().defaultRandom(),
	kurioId: d
		.uuid("kurio_id")
		.notNull()
		.references(() => kurios.id, { onDelete: "cascade" }),
	title: d.varchar({ length: 255 }).notNull(),
	orderIndex: d.integer("order_index").notNull(),
	createdAt: d
		.timestamp("created_at", { withTimezone: true })
		.$defaultFn(() => new Date())
		.notNull(),
}), (table) => [
	index("units_kurio_id_order_idx").on(table.kurioId, table.orderIndex),
	
	// RLS Policies - Inherit from parent kurio
	pgPolicy("users-select-own-units", {
		for: "select",
		to: authenticatedRole,
		using: sql`EXISTS (
			SELECT 1 FROM kurios
			WHERE kurios.id = ${table.kurioId}
			AND kurios.user_id = ${authUid}
		)`,
	}),
	pgPolicy("users-insert-own-units", {
		for: "insert",
		to: authenticatedRole,
		withCheck: sql`EXISTS (
			SELECT 1 FROM kurios
			WHERE kurios.id = ${table.kurioId}
			AND kurios.user_id = ${authUid}
		)`,
	}),
	pgPolicy("users-update-own-units", {
		for: "update",
		to: authenticatedRole,
		using: sql`EXISTS (
			SELECT 1 FROM kurios
			WHERE kurios.id = ${table.kurioId}
			AND kurios.user_id = ${authUid}
		)`,
	}),
	pgPolicy("users-delete-own-units", {
		for: "delete",
		to: authenticatedRole,
		using: sql`EXISTS (
			SELECT 1 FROM kurios
			WHERE kurios.id = ${table.kurioId}
			AND kurios.user_id = ${authUid}
		)`,
	}),
])

export const unitsRelations = relations(units, ({ one, many }) => ({
	kurio: one(kurios, {
		fields: [units.kurioId],
		references: [kurios.id],
	}),
	games: many(games),
	progress: many(unitProgress),
}))

