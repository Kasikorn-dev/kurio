import { relations } from "drizzle-orm"
import { pgEnum } from "drizzle-orm/pg-core"
import { createTable } from "../lib/utils"
import { kurios } from "./kurios"

export const kurioResourceTypeEnum = pgEnum("kurio_resource_type", [
	"text",
	"file",
	"image",
])

export const kurioResources = createTable("kurio_resource", (d) => ({
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
}))

export const kurioResourcesRelations = relations(kurioResources, ({ one }) => ({
	kurio: one(kurios, {
		fields: [kurioResources.kurioId],
		references: [kurios.id],
	}),
}))

// // Indexes for kurio_resources table
// export const kurioResourcesKurioIdOrderIdx = index(
// 	"kurio_resources_kurio_id_order_idx",
// ).on(kurioResources.kurioId, kurioResources.orderIndex)
// // ทำไม: Composite index สำหรับ query ที่หา resources ของ kurio และเรียงตาม orderIndex
// // เช่น: SELECT * FROM kurio_resources WHERE kurioId = ? ORDER BY orderIndex ASC
