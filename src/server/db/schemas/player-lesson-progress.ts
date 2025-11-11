import { relations } from "drizzle-orm"
import { createTable } from "../lib/utils"
import { lessons } from "./lessons"
import { userProfiles } from "./user-profiles"

export const playerLessonProgress = createTable(
	"player_lesson_progress",
	(d) => ({
		id: d.uuid().primaryKey().defaultRandom(),
		playerId: d
			.uuid("player_id")
			.notNull()
			.references(() => userProfiles.userId),
		lessonId: d
			.uuid("lesson_id")
			.notNull()
			.references(() => lessons.id),
		completedExercises: d.integer("completed_exercises").default(0).notNull(),
		totalExercises: d.integer("total_exercises").notNull(),
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
)

export const playerLessonProgressRelations = relations(
	playerLessonProgress,
	({ one }) => ({
		player: one(userProfiles, {
			fields: [playerLessonProgress.playerId],
			references: [userProfiles.id],
		}),
		lesson: one(lessons, {
			fields: [playerLessonProgress.lessonId],
			references: [lessons.id],
		}),
	}),
)
