import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from "@/server/api/trpc"
import { userProfiles } from "@/server/db/schemas"

export const authRouter = createTRPCRouter({
	getProfile: protectedProcedure.query(
		async ({ ctx }): Promise<typeof userProfiles.$inferSelect | null> => {
			const profile = await ctx.db.query.userProfiles.findFirst({
				where: (profiles, { eq }) => eq(profiles.userId, ctx.user.id),
			})

			return profile ?? null
		},
	),

	getUserIdentities: protectedProcedure.query(async ({ ctx }) => {
		const adminClient = createSupabaseAdminClient()
		const { data: userData } = await adminClient.auth.admin.getUserById(
			ctx.user.id,
		)

		if (!userData?.user) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "User not found",
			})
		}

		const identities = userData.user.identities || []
		const providers = identities.map((id) => id.provider)

		return {
			identities,
			providers,
			hasEmailPassword: providers.includes("email"),
			hasGoogle: providers.includes("google"),
		}
	}),

	updateProfile: protectedProcedure
		.input(
			z.object({
				displayName: z.string().min(1).max(255).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [profile] = await ctx.db
				.update(userProfiles)
				.set({
					displayName: input.displayName,
					updatedAt: new Date(),
				})
				.where(eq(userProfiles.userId, ctx.user.id))
				.returning()

			if (!profile) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profile not found",
				})
			}

			return profile
		}),
})
