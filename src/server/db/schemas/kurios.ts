import { relations } from "drizzle-orm"
import { index, pgEnum } from "drizzle-orm/pg-core"
import { createTable } from "../lib/utils"
import { kurioResources } from "./kurio-resources"
import { units } from "./units"
import { userProfiles } from "./user-profiles"

export const kurioStatusEnum = pgEnum("kurio_status", [
	"draft",
	"generating",
	"ready",
	"error",
])

export const kurios = createTable("kurio", (d) => ({
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
	status: d
		.varchar({ length: 50 })
		.$type<"draft" | "generating" | "ready" | "error">()
		.default("draft")
		.notNull(),
	totalGames: d.integer("total_games").default(0).notNull(),
	hasAutoGenTriggered: d.boolean("has_auto_gen_triggered").default(false).notNull(),
	createdAt: d
		.timestamp("created_at", { withTimezone: true })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: d
		.timestamp("updated_at", { withTimezone: true })
		.$onUpdate(() => new Date()),
}), (table) => [
	index("kurios_user_id_idx").on(table.userId),
	index("kurios_created_at_idx").on(table.createdAt),
	index("kurios_user_id_created_at_idx").on(table.userId, table.createdAt),
])

export const kuriosRelations = relations(kurios, ({ one, many }) => ({
	user: one(userProfiles, {
		fields: [kurios.userId],
		references: [userProfiles.id],
	}),
	resources: many(kurioResources),
	units: many(units),
}))

