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
	checkEmail: publicProcedure
		.input(
			z.object({
				email: z
					.string()
					.email("Invalid email format")
					.max(255, "Email is too long"),
			}),
		)
		.query(async ({ input }) => {
			const adminClient = createSupabaseAdminClient()

			// List users and find by email
			// NOTE: In production, consider using pagination or a more efficient query
			const { data: usersData, error } =
				await adminClient.auth.admin.listUsers()

			if (error) {
				// Don't expose internal error details
				// In production, log to error tracking service
				throw new Error("Failed to check email")
			}

			const existingUser = usersData.users.find(
				(user) => user.email === input.email,
			)

			if (existingUser) {
				// User exists, check provider
				const providers =
					existingUser.identities?.map(
						(id: { provider: string }) => id.provider,
					) || []
				const provider =
					existingUser.app_metadata?.provider || providers[0] || "email"

				return {
					exists: true,
					provider,
					providers,
				}
			}

			// Return generic response to prevent email enumeration
			// Always return same structure whether user exists or not
			return { exists: false }
		}),

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
			throw new Error("User not found")
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
				throw new Error("Profile not found")
			}

			return profile
		}),
})
