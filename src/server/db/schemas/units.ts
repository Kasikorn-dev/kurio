import { relations } from "drizzle-orm"
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
}))

export const unitsRelations = relations(units, ({ one, many }) => ({
	kurio: one(kurios, {
		fields: [units.kurioId],
		references: [kurios.id],
	}),
	games: many(games),
	progress: many(unitProgress),
}))

// // Indexes for units table
// export const unitsKurioIdOrderIdx = index("units_kurio_id_order_idx").on(
// 	units.kurioId,
// 	units.orderIndex,
// )
// // ทำไม: Composite index สำหรับ query ที่หา units ของ kurio และเรียงตาม orderIndex
// // เช่น: SELECT * FROM units WHERE kurioId = ? ORDER BY orderIndex ASC
