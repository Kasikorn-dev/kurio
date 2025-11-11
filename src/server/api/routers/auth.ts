import { eq } from "drizzle-orm"
import { z } from "zod"

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { userProfiles } from "@/server/db/schemas"

export const authRouter = createTRPCRouter({
	getProfile: protectedProcedure.query(async ({ ctx }) => {
		const profile = await ctx.db.query.userProfiles.findFirst({
			where: (profiles, { eq }) => eq(profiles.userId, ctx.user.id),
		})

		return profile
	}),

	updateProfile: protectedProcedure
		.input(
			z.object({
				displayName: z.string().min(1).max(255).optional(),
				avatarUrl: z.string().url().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [profile] = await ctx.db
				.update(userProfiles)
				.set({
					displayName: input.displayName,
					avatarUrl: input.avatarUrl,
					updatedAt: new Date(),
				})
				.where(eq(userProfiles.userId, ctx.user.id))
				.returning()

			if (!profile) {
				throw new Error("Profile not found")
			}

			return profile
		}),
})
