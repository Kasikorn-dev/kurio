import { relations } from "drizzle-orm"
import { createTable } from "../lib/utils"
import { kurios } from "./kurios"
import { playerExercisePlays } from "./player-exercise-plays"
import { playerLessonProgress } from "./player-lesson-progress"

export const userProfiles = createTable("user_profile", (d) => ({
	id: d.uuid().primaryKey().defaultRandom(),
	// userId references auth.users.id (Supabase Auth)
	// Foreign key constraint should be created via SQL migration
	userId: d.uuid("user_id").notNull().unique(),
	displayName: d.varchar("display_name", { length: 255 }),
	avatarUrl: d.varchar("avatar_url"),
	createdAt: d
		.timestamp("created_at", { withTimezone: true })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: d
		.timestamp("updated_at", { withTimezone: true })
		.$onUpdate(() => new Date()),
}))

export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
	kurios: many(kurios),
	exercisePlays: many(playerExercisePlays),
	lessonProgress: many(playerLessonProgress),
}))
