import { relations, sql } from "drizzle-orm"
import { index, pgEnum, pgPolicy } from "drizzle-orm/pg-core"
import { authenticatedRole, authUid } from "drizzle-orm/supabase"
import { createTable } from "../lib/utils"
import { resources } from "./resources"
import { units } from "./units"
import { userProfiles } from "./user-profiles"

export const kurioStatusEnum = pgEnum("kurio_status", [
	"draft",
	"generating",
	"generating_units",
	"generating_games",
	"ready",
	"error",
])

export const kurios = createTable(
	"kurio",
	(d) => ({
		id: d.uuid().primaryKey().defaultRandom(),
		userId: d
			.uuid("user_id")
			.notNull()
			.references(() => userProfiles.userId),
		title: d.varchar({ length: 255 }).notNull(),
		description: d.text(),
		autoGenEnabled: d.boolean("auto_gen_enabled").default(true).notNull(),
		autoGenThreshold: d.integer("auto_gen_threshold").default(80).notNull(),
		unitCount: d.integer("unit_count"),
		aiModel: d
			.varchar("ai_model", { length: 50 })
			.default("gpt-5-nano-2025-08-07")
			.notNull(),
		status: kurioStatusEnum("status").default("draft").notNull(),
		totalGames: d.integer("total_games").default(0).notNull(),
		hasAutoGenTriggered: d
			.boolean("has_auto_gen_triggered")
			.default(false)
			.notNull(),
		// Progress tracking for generation
		generationProgress: d.integer("generation_progress").default(0).notNull(),
		generationStep: d.varchar("generation_step", { length: 50 }),
		unitsCompleted: d.integer("units_completed").default(0).notNull(),
		// Pre-processing fields
		summary: d.text("summary"),
		processedAt: d.timestamp("processed_at", { withTimezone: true }),
		createdAt: d
			.timestamp("created_at", { withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d
			.timestamp("updated_at", { withTimezone: true })
			.$onUpdate(() => new Date()),
	}),
	(table) => [
		index("kurios_user_id_idx").on(table.userId),
		index("kurios_created_at_idx").on(table.createdAt),
		index("kurios_user_id_created_at_idx").on(table.userId, table.createdAt),

		// RLS Policies
		pgPolicy("users-select-own-kurios", {
			for: "select",
			to: authenticatedRole,
			using: sql`${authUid} = ${table.userId}`,
		}),
		pgPolicy("users-insert-own-kurios", {
			for: "insert",
			to: authenticatedRole,
			withCheck: sql`${authUid} = ${table.userId}`,
		}),
		pgPolicy("users-update-own-kurios", {
			for: "update",
			to: authenticatedRole,
			using: sql`${authUid} = ${table.userId}`,
			withCheck: sql`${authUid} = ${table.userId}`,
		}),
		pgPolicy("users-delete-own-kurios", {
			for: "delete",
			to: authenticatedRole,
			using: sql`${authUid} = ${table.userId}`,
		}),
	],
)

export const kuriosRelations = relations(kurios, ({ one, many }) => ({
	user: one(userProfiles, {
		fields: [kurios.userId],
		references: [userProfiles.id],
	}),
	resources: many(resources),
	units: many(units),
}))
