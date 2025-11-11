import { relations } from "drizzle-orm"
import { createTable } from "../lib/utils"
import { exercises } from "./exercises"
import { userProfiles } from "./user-profiles"

export const playerExercisePlays = createTable("player_exercise_play", (d) => ({
	id: d.uuid().primaryKey().defaultRandom(),
	playerId: d
		.uuid("player_id")
		.notNull()
		.references(() => userProfiles.userId),
	exerciseId: d
		.uuid("exercise_id")
		.notNull()
		.references(() => exercises.id),
	userAnswer: d.jsonb("user_answer").$type<Record<string, unknown>>().notNull(),
	isCorrect: d.boolean("is_correct").notNull(),
	score: d.integer().notNull(),
	timeSpent: d.integer("time_spent").notNull(), // วินาที
	playedAt: d
		.timestamp("played_at", { withTimezone: true })
		.$defaultFn(() => new Date())
		.notNull(),
}))

export const playerExercisePlaysRelations = relations(
	playerExercisePlays,
	({ one }) => ({
		player: one(userProfiles, {
			fields: [playerExercisePlays.playerId],
			references: [userProfiles.id],
		}),
		exercise: one(exercises, {
			fields: [playerExercisePlays.exerciseId],
			references: [exercises.id],
		}),
	}),
)
