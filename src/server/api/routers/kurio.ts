import { TRPCError } from "@trpc/server"
import { desc, eq } from "drizzle-orm"
import { z } from "zod"
import { AI_CONSTANTS } from "@/lib/constants"
import { logger } from "@/lib/monitoring/logger"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { kurios, resources } from "@/server/db/schemas"

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
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Kurio not found",
				})
			}

			if (kurio.userId !== ctx.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have permission to access this kurio",
				})
			}

			return kurio
		}),

	create: protectedProcedure
		.input(
			z.object({
				resources: z.array(
					z.object({
						type: z.enum(["text", "file", "image"]),
						content: z.string().optional(),
						fileUrl: z.string().url().optional(),
						filePath: z.string().optional(),
						fileType: z.string().optional(),
						orderIndex: z.number().int(),
					}),
				),
				autoGenEnabled: z.boolean().optional(),
				autoGenThreshold: z.number().optional(),
				unitCount: z.number().int().optional(),
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
					status: input.unitCount ? "generating" : "ready", // Set to generating if unitCount provided
				})
				.returning()

			if (!newKurio) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create kurio",
				})
			}

			// Insert resources
			if (input.resources.length > 0) {
				await ctx.db.insert(resources).values(
					input.resources.map((resource) => ({
						kurioId: newKurio.id,
						type: resource.type,
						content: resource.content,
						fileUrl: resource.fileUrl,
						filePath: resource.filePath,
						fileType: resource.fileType,
						orderIndex: resource.orderIndex,
					})),
				)
			}

			// If unitCount is provided, trigger background generation via Edge Function
			if (input.unitCount && input.unitCount > 0) {
				const supabaseAdmin = createSupabaseAdminClient()
			

				// Call Edge Function in background (fire-and-forget)
				// Don't await - let it run in background while we return immediately
				supabaseAdmin.functions
					.invoke("generate-kurio-units", {
						body: {
							kurioId: newKurio.id,
							resources: input.resources,
							unitCount: input.unitCount,
							gamesPerUnit: AI_CONSTANTS.GAMES_PER_UNIT,
							userId: ctx.user.id,
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
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Kurio not found",
				})
			}

			if (updated.userId !== ctx.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have permission to update this kurio",
				})
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
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Kurio not found",
				})
			}

			if (kurio.userId !== ctx.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have permission to delete this kurio",
				})
			}

			await ctx.db.delete(kurios).where(eq(kurios.id, input.id))

			return { success: true }
		}),
})
