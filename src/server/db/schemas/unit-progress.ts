import { relations } from "drizzle-orm"
import { createTable } from "../lib/utils"
import { units } from "./units"
import { userProfiles } from "./user-profiles"

export const unitProgress = createTable("unit_progress", (d) => ({
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
}))

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

// // Indexes for unit_progress table
// export const unitProgressPlayerIdUnitIdIdx = uniqueIndex(
// 	"unit_progress_player_id_unit_id_idx",
// ).on(unitProgress.playerId, unitProgress.unitId)
// // ทำไม: UNIQUE composite index เพื่อป้องกัน duplicate progress records
// // และใช้ใน WHERE clause ที่ query ทั้ง playerId และ unitId พร้อมกัน
// // เช่น: WHERE playerId = ? AND unitId = ?

// export const unitProgressPlayerIdIdx = index("unit_progress_player_id_idx").on(
// 	unitProgress.playerId,
// )
// // ทำไม: ใช้ใน WHERE clause เพื่อหา progress ของ player - query: WHERE playerId = ?

// export const unitProgressUnitIdIdx = index("unit_progress_unit_id_idx").on(
// 	unitProgress.unitId,
// )
// // ทำไม: ใช้ใน WHERE clause เพื่อหา progress ของ unit - query: WHERE unitId = ? หรือ IN (unitIds)

// export const unitProgressPlayerIdCompletedIdx = index(
// 	"unit_progress_player_id_completed_idx",
// ).on(unitProgress.playerId, unitProgress.isCompleted)
// // ทำไม: Composite index สำหรับ query ที่หาความคืบหน้าของ player ที่เสร็จแล้วหรือยังไม่เสร็จ
// // เช่น: WHERE playerId = ? AND isCompleted = true
