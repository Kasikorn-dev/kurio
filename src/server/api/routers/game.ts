import { eq } from "drizzle-orm"
import { z } from "zod"
import { generateGameContent } from "@/lib/ai/game-generator"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { gameAttempts, kurios } from "@/server/db/schemas"
import {
	batchInsertUnitsAndGames,
	getUserProfileId,
	upsertUnitProgress,
} from "./game-helpers"

export const gameRouter = createTRPCRouter({
	submitAnswer: protectedProcedure
		.input(
			z.object({
				gameId: z.string().uuid(),
				userAnswer: z.record(z.unknown()),
				isCorrect: z.boolean(),
				score: z.number().int(),
				timeSpent: z.number().int(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Get user profile ID
			const playerId = await getUserProfileId(ctx.db, ctx.user.id)

			// Get game with unit info
			const game = await ctx.db.query.games.findFirst({
				where: (games, { eq }) => eq(games.id, input.gameId),
				with: {
					unit: {
						with: {
							games: true,
						},
					},
				},
			})

			if (!game) {
				throw new Error("Game not found")
			}

			const totalGames = game.unit.games.length

			// Use transaction for atomic operations
			await ctx.db.transaction(async (tx) => {
				// Record the attempt
				await tx.insert(gameAttempts).values({
					playerId,
					gameId: input.gameId,
					userAnswer: input.userAnswer,
					isCorrect: input.isCorrect,
					score: input.score,
					timeSpent: input.timeSpent,
				})

				// Update unit progress
				await upsertUnitProgress(tx, playerId, game.unitId, totalGames)
			})

			return { success: true }
		}),

	getAllUnitProgress: protectedProcedure
		.input(z.object({ unitIds: z.array(z.string().uuid()) }))
		.query(async ({ ctx, input }) => {
			if (input.unitIds.length === 0) {
				return []
			}

			const playerId = await getUserProfileId(ctx.db, ctx.user.id)

			const progress = await ctx.db.query.unitProgress.findMany({
				where: (progress, { eq, and, inArray }) =>
					and(
						eq(progress.playerId, playerId),
						inArray(progress.unitId, input.unitIds),
					),
			})

			return progress
		}),

	generateGame: protectedProcedure
		.input(
			z.object({
				kurioId: z.string().uuid(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Get kurio with resources
			const kurio = await ctx.db.query.kurios.findFirst({
				where: (kurios, { eq }) => eq(kurios.id, input.kurioId),
				with: {
					resources: true,
				},
			})

			if (!kurio) {
				throw new Error("Kurio not found")
			}

			if (kurio.userId !== ctx.user.id) {
				throw new Error("Unauthorized")
			}

			// Generate game content using AI
			const gameContent = await generateGameContent({
				resources: kurio.resources.map((r) => ({
					resourceType: r.resourceType,
					resourceContent: r.resourceContent ?? undefined,
					resourceFileUrl: r.resourceFileUrl ?? undefined,
				})),
				aiModel: kurio.aiModel,
			})

			// Batch insert units and games for better performance
			const totalGames = await batchInsertUnitsAndGames(
				ctx.db,
				kurio.id,
				gameContent.units,
			)

			// Update kurio status and total games
			await ctx.db
				.update(kurios)
				.set({
					status: "ready",
					totalExercises: totalGames,
					updatedAt: new Date(),
				})
				.where(eq(kurios.id, kurio.id))

			return { success: true, totalGames }
		}),
})
