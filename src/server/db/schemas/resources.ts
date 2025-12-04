import { relations, sql } from "drizzle-orm"
import { index, pgEnum, pgPolicy } from "drizzle-orm/pg-core"
import { authenticatedRole, authUid } from "drizzle-orm/supabase"
import { createTable } from "../lib/utils"
import { kurios } from "./kurios"

export const resourceTypeEnum = pgEnum("resource_type", [
	"text",
	"file",
	"image",
])

export const resources = createTable(
	"resource",
	(d) => ({
		id: d.uuid().primaryKey().defaultRandom(),
		kurioId: d
			.uuid("kurio_id")
			.notNull()
			.references(() => kurios.id, { onDelete: "cascade" }),
		type: resourceTypeEnum("type").notNull(),
		content: d.text("content"), // For text input
		fileUrl: d.text("file_url"), // For file/image URLs (changed from varchar to text for long URLs)
		fileType: d.varchar("file_type", { length: 100 }), // MIME type
		orderIndex: d.integer("order_index").notNull(),
		createdAt: d
			.timestamp("created_at", { withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(table) => [
		index("resources_kurio_id_order_idx").on(table.kurioId, table.orderIndex),

		// RLS Policies - Inherit from parent kurio
		pgPolicy("users-select-own-resources", {
			for: "select",
			to: authenticatedRole,
			using: sql`EXISTS (
			SELECT 1 FROM kurios
			WHERE kurios.id = ${table.kurioId}
			AND kurios.user_id = ${authUid}
		)`,
		}),
		pgPolicy("users-insert-own-resources", {
			for: "insert",
			to: authenticatedRole,
			withCheck: sql`EXISTS (
			SELECT 1 FROM kurios
			WHERE kurios.id = ${table.kurioId}
			AND kurios.user_id = ${authUid}
		)`,
		}),
		pgPolicy("users-update-own-resources", {
			for: "update",
			to: authenticatedRole,
			using: sql`EXISTS (
			SELECT 1 FROM kurios
			WHERE kurios.id = ${table.kurioId}
			AND kurios.user_id = ${authUid}
		)`,
		}),
		pgPolicy("users-delete-own-resources", {
			for: "delete",
			to: authenticatedRole,
			using: sql`EXISTS (
			SELECT 1 FROM kurios
			WHERE kurios.id = ${table.kurioId}
			AND kurios.user_id = ${authUid}
		)`,
		}),
	],
)

export const resourcesRelations = relations(resources, ({ one }) => ({
	kurio: one(kurios, {
		fields: [resources.kurioId],
		references: [kurios.id],
	}),
}))
