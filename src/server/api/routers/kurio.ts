import { desc, eq } from "drizzle-orm"
import { z } from "zod"

import { generateGameContent } from "@/lib/ai/game-generator"
import { AI_CONSTANTS } from "@/lib/constants"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { kurioResources, kurios } from "@/server/db/schemas"
import { batchInsertUnitsAndGames } from "./game-helpers"

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
				autoGenEnabled: z.boolean().default(true),
				autoGenThreshold: z.number().int().min(0).max(100).default(80),
				unitCount: z.number().int().min(1).optional(),
				aiModel: z.string().default("gpt-5-nano-2025-08-07"),
				resources: z.array(
					z.object({
						resourceType: z.enum(["text", "file", "image"]),
						resourceContent: z.string().optional(),
						resourceFileUrl: z.string().url().optional(),
						resourceFileType: z.string().optional(),
						orderIndex: z.number().int(),
					}),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
		// Calculate unit count based on auto-gen setting
		const unitCount = input.autoGenEnabled
			? AI_CONSTANTS.AUTO_GEN.INITIAL_UNITS
			: input.unitCount ?? 1

		// Create kurio with temporary title (will be updated by AI)
		const [newKurio] = await ctx.db
			.insert(kurios)
			.values({
				userId: ctx.user.id,
				title: "Generating...",
				description: null,
				autoGenEnabled: input.autoGenEnabled,
				autoGenThreshold: input.autoGenThreshold,
				unitCount: unitCount,
				aiModel: input.aiModel,
				status: "generating",
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

		try {
			// Generate game content using AI (includes title, description, and units)
			const gameContent = await generateGameContent({
				resources: input.resources.map((r) => ({
					resourceType: r.resourceType,
					resourceContent: r.resourceContent ?? undefined,
					resourceFileUrl: r.resourceFileUrl ?? undefined,
				})),
				aiModel: input.aiModel,
				unitCount: unitCount,
				gamesPerUnit: AI_CONSTANTS.GAMES_PER_UNIT,
			})

			// Batch insert units and games
			const totalGames = await batchInsertUnitsAndGames(
				ctx.db,
				newKurio.id,
				gameContent.units,
			)

			// Update kurio with AI-generated title, description, and status
			const [updatedKurio] = await ctx.db
				.update(kurios)
				.set({
					title: gameContent.title,
					description: gameContent.description ?? null,
					status: "ready",
					totalGames: totalGames,
					updatedAt: new Date(),
				})
				.where(eq(kurios.id, newKurio.id))
				.returning()

			if (!updatedKurio) {
				throw new Error("Failed to update kurio")
			}

			return updatedKurio
		} catch (error) {
			// Update status to error if generation fails
			await ctx.db
				.update(kurios)
				.set({
					status: "error",
					updatedAt: new Date(),
				})
				.where(eq(kurios.id, newKurio.id))

			throw error instanceof Error
				? error
				: new Error("Failed to generate game content")
		}
	}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().min(1).max(255).optional(),
				description: z.string().optional(),
				autoGenEnabled: z.boolean().optional(),
				autoGenThreshold: z.number().int().min(0).max(100).optional(),
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
