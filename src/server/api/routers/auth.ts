import { z } from "zod"

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc"
import { userProfiles } from "@/server/db/schemas"

export const authRouter = createTRPCRouter({
	getProfile: protectedProcedure.query(async ({ ctx }) => {
		const profile = await ctx.db.query.userProfiles.findFirst({
			where: (profiles, { eq }) => eq(profiles.userId, ctx.user.id),
		})

		return profile
	}),

	createProfile: protectedProcedure
		.input(
			z.object({
				displayName: z.string().min(1).max(255).optional(),
				avatarUrl: z.string().url().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const profile = await ctx.db
				.insert(userProfiles)
				.values({
					userId: ctx.user.id,
					displayName: input.displayName ?? ctx.user.email?.split("@")[0],
					avatarUrl: input.avatarUrl,
				})
				.returning()

			return profile[0]
		}),

	updateProfile: protectedProcedure
		.input(
			z.object({
				displayName: z.string().min(1).max(255).optional(),
				avatarUrl: z.string().url().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const profile = await ctx.db
				.update(userProfiles)
				.set({
					displayName: input.displayName,
					avatarUrl: input.avatarUrl,
					updatedAt: new Date(),
				})
				.where((profiles, { eq }) => eq(profiles.userId, ctx.user.id))
				.returning()

			return profile[0]
		}),
})

