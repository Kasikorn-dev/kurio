import { relations } from "drizzle-orm"
import { index } from "drizzle-orm/pg-core"
import { createTable } from "../lib/utils"
import { gameAttempts } from "./game-attempts"
import { kurios } from "./kurios"
import { unitProgress } from "./unit-progress"

export const userProfiles = createTable("user_profile", (d) => ({
	id: d.uuid().primaryKey().defaultRandom(),
	// userId references auth.users.id (Supabase Auth)
	// Foreign key constraint should be created via SQL migration
	userId: d.uuid("user_id").notNull().unique(),
	displayName: d.varchar("display_name", { length: 255 }),
	createdAt: d
		.timestamp("created_at", { withTimezone: true })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: d
		.timestamp("updated_at", { withTimezone: true })
		.$onUpdate(() => new Date()),
}), (table) => [
	index("user_profiles_user_id_idx").on(table.userId),
])

export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
	kurios: many(kurios),
	gameAttempts: many(gameAttempts),
	unitProgress: many(unitProgress),
}))
