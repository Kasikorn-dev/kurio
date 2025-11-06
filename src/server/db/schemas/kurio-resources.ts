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
		.references(() => kurios.id),
	resourceType: d
		.varchar("resource_type", { length: 50 })
		.$type<"text" | "file" | "image">()
		.notNull(),
	resourceContent: d.text("resource_content"),
	resourceFileUrl: d.varchar("resource_file_url"),
	resourceFileType: d.varchar("resource_file_type", { length: 50 }),
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
