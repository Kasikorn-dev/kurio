import { relations, sql } from "drizzle-orm"
import { index, pgEnum, pgPolicy } from "drizzle-orm/pg-core"
import { authenticatedRole, authUid } from "drizzle-orm/supabase"
import { createTable } from "../lib/utils"
import { kurios } from "./kurios"

export const kurioResourceTypeEnum = pgEnum("kurio_resource_type", [
	"text",
	"file",
	"image",
])

export const kurioResources = createTable(
	"kurio_resource",
	(d) => ({
		id: d.uuid().primaryKey().defaultRandom(),
		kurioId: d
			.uuid("kurio_id")
			.notNull()
			.references(() => kurios.id, { onDelete: "cascade" }),
		resourceType: d
			.varchar("resource_type", { length: 50 })
			.$type<"text" | "file" | "image">()
			.notNull(),
		resourceContent: d.text("resource_content"), // สำหรับ text input
		resourceFileUrl: d.text("resource_file_url"), // เปลี่ยนจาก varchar เป็น text เพื่อรองรับ URL ที่ยาว
		resourceFileType: d.varchar("resource_file_type", { length: 100 }), // เพิ่มความยาวเพื่อรองรับ MIME types ที่ยาวขึ้น
		orderIndex: d.integer("order_index").notNull(),
		createdAt: d
			.timestamp("created_at", { withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(table) => [
		index("kurio_resources_kurio_id_order_idx").on(
			table.kurioId,
			table.orderIndex,
		),

		// RLS Policies - Inherit from parent kurio
		pgPolicy("users-select-own-kurio-resources", {
			for: "select",
			to: authenticatedRole,
			using: sql`EXISTS (
			SELECT 1 FROM kurios
			WHERE kurios.id = ${table.kurioId}
			AND kurios.user_id = ${authUid}
		)`,
		}),
		pgPolicy("users-insert-own-kurio-resources", {
			for: "insert",
			to: authenticatedRole,
			withCheck: sql`EXISTS (
			SELECT 1 FROM kurios
			WHERE kurios.id = ${table.kurioId}
			AND kurios.user_id = ${authUid}
		)`,
		}),
		pgPolicy("users-update-own-kurio-resources", {
			for: "update",
			to: authenticatedRole,
			using: sql`EXISTS (
			SELECT 1 FROM kurios
			WHERE kurios.id = ${table.kurioId}
			AND kurios.user_id = ${authUid}
		)`,
		}),
		pgPolicy("users-delete-own-kurio-resources", {
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

export const kurioResourcesRelations = relations(kurioResources, ({ one }) => ({
	kurio: one(kurios, {
		fields: [kurioResources.kurioId],
		references: [kurios.id],
	}),
}))
