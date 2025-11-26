import { desc, eq } from "drizzle-orm"
import { z } from "zod"
import { AI_CONSTANTS } from "@/lib/constants"
import { logger } from "@/lib/monitoring/logger"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { kurioResources, kurios } from "@/server/db/schemas"

export const kurioRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.db.query.kurios.findMany({
			where: (kurios, { eq }) => eq(kurios.userId, ctx.user.id),
			orderBy: [desc(kurios.createdAt)],
			with: {
				resources: true,
			},
		})
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			const kurio = await ctx.db.query.kurios.findFirst({
				where: (kurios, { eq }) => eq(kurios.id, input.id),
				with: {
					resources: {
						orderBy: (resources, { asc }) => [asc(resources.orderIndex)],
					},
					units: {
						orderBy: (units, { asc }) => [asc(units.orderIndex)],
						with: {
							games: {
								orderBy: (games, { asc }) => [asc(games.orderIndex)],
							},
						},
					},
				},
			})

			if (!kurio) {
				throw new Error("Kurio not found")
			}

			if (kurio.userId !== ctx.user.id) {
				throw new Error("Unauthorized")
			}

			return kurio
		}),

	create: protectedProcedure
		.input(
			z.object({
				resources: z.array(
					z.object({
						resourceType: z.enum(["text", "file", "image"]),
						resourceContent: z.string().optional(),
						resourceFileUrl: z.string().url().optional(),
						resourceFileType: z.string().optional(),
						orderIndex: z.number().int(),
					}),
				),
				autoGenEnabled: z.boolean().optional(),
				autoGenThreshold: z.number().optional(),
				unitCount: z.number().int().optional(),
				aiModel: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Create kurio
			const [newKurio] = await ctx.db
				.insert(kurios)
				.values({
					userId: ctx.user.id,
					title: input.unitCount ? "Generating..." : "New Kurio",
					description: input.unitCount ? "Generating..." : null,
					autoGenEnabled: input.autoGenEnabled ?? false,
					autoGenThreshold: input.autoGenThreshold ?? 80,
					unitCount: input.unitCount ?? null,
					aiModel: input.aiModel ?? "gpt-4o-mini",
					status: input.unitCount ? "generating" : "ready", // Set to generating if unitCount provided
				})
				.returning()

			if (!newKurio) {
				throw new Error("Failed to create kurio")
			}

			// Insert resources
			if (input.resources.length > 0) {
				await ctx.db.insert(kurioResources).values(
					input.resources.map((resource) => ({
						kurioId: newKurio.id,
						resourceType: resource.resourceType,
						resourceContent: resource.resourceContent,
						resourceFileUrl: resource.resourceFileUrl,
						resourceFileType: resource.resourceFileType,
						orderIndex: resource.orderIndex,
					})),
				)
			}

			// If unitCount is provided, trigger background generation via Edge Function
			if (input.unitCount && input.unitCount > 0) {
				const supabaseAdmin = createSupabaseAdminClient()
				const resources = input.resources.map((r) => ({
					resourceType: r.resourceType,
					resourceContent: r.resourceContent,
					resourceFileUrl: r.resourceFileUrl,
				}))

				// Call Edge Function in background (fire-and-forget)
				// Don't await - let it run in background while we return immediately
				supabaseAdmin.functions
					.invoke("generate-kurio-units", {
						body: {
							kurioId: newKurio.id,
							resources,
							unitCount: input.unitCount,
							gamesPerUnit: AI_CONSTANTS.GAMES_PER_UNIT,
							userId: ctx.user.id,
							aiModel: newKurio.aiModel,
						},
					})
					.catch((error) => {
						// Log error but don't fail the kurio creation
						// Edge Function will handle retries or we can update status to error later
						logger.error("Failed to start unit generation", error, {
							kurioId: newKurio.id,
						})
					})
			}

			return newKurio
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().min(1).max(255).optional(),
				description: z.string().optional(),
				autoGenEnabled: z.boolean().optional(),
				autoGenThreshold: z.number().optional(),
				unitCount: z.number().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input

			const [updated] = await ctx.db
				.update(kurios)
				.set({
					...updateData,
					updatedAt: new Date(),
				})
				.where(eq(kurios.id, id))
				.returning()

			if (!updated) {
				throw new Error("Kurio not found")
			}

			if (updated.userId !== ctx.user.id) {
				throw new Error("Unauthorized")
			}

			return updated
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const kurio = await ctx.db.query.kurios.findFirst({
				where: (kurios, { eq }) => eq(kurios.id, input.id),
			})

			if (!kurio) {
				throw new Error("Kurio not found")
			}

			if (kurio.userId !== ctx.user.id) {
				throw new Error("Unauthorized")
			}

			await ctx.db.delete(kurios).where(eq(kurios.id, input.id))

			return { success: true }
		}),
})
