import { count, eq } from "drizzle-orm"
import { z } from "zod"
import { logger } from "@/lib/monitoring/logger"
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { gameAttempts, games } from "@/server/db/schemas"
import { upsertUnitProgress } from "./game-helpers"

export const gameRouter = createTRPCRouter({
	getById: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			const game = await ctx.db.query.games.findFirst({
				where: (games, { eq }) => eq(games.id, input.id),
			})

			if (!game) {
				throw new Error("Game not found")
			}

			return game
		}),

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
			// playerId should be userId (from auth) not userProfile.id
			// because both game_attempt.player_id and unit_progress.player_id
			// reference user_profile.user_id (not user_profile.id)
			const playerId = ctx.user.id

			// Get only unitId (fastest query - no joins)
			const game = await ctx.db.query.games.findFirst({
				where: (games, { eq }) => eq(games.id, input.gameId),
				columns: {
					unitId: true,
				},
			})

			if (!game) {
				throw new Error("Game not found")
			}

			// Get totalGames count separately (faster than loading all games)
			const result = await ctx.db
				.select({ count: count() })
				.from(games)
				.where(eq(games.unitId, game.unitId))

			const totalGames = result[0]?.count ?? 0

			// Get kurioId for auto-gen (only if needed)
			const unit = await ctx.db.query.units.findFirst({
				where: (units, { eq }) => eq(units.id, game.unitId),
				columns: {
					kurioId: true,
				},
			})

			// Use transaction for atomic operations
			await ctx.db.transaction(async (tx) => {
				// Record the attempt
				// playerId must be userId (from auth) to match foreign key constraint
				await tx.insert(gameAttempts).values({
					playerId, // This is ctx.user.id (userId from auth)
					gameId: input.gameId,
					userAnswer: input.userAnswer,
					isCorrect: input.isCorrect,
					score: input.score,
					timeSpent: input.timeSpent,
				})

				// Update unit progress using ON CONFLICT (faster than findFirst + update)
				await upsertUnitProgress(tx, playerId, game.unitId, totalGames)
			})

			// Trigger auto-gen check in background (fire-and-forget, don't await)
			if (unit?.kurioId) {
				setImmediate(async () => {
					try {
						const { checkAndGenerateUnits } = await import("./auto-gen-helpers")
						await checkAndGenerateUnits(ctx.db, unit.kurioId, ctx.user.id)
					} catch (error) {
						// Log error but don't fail the game submission
						logger.error("Auto-gen check failed", error, {
							kurioId: unit.kurioId,
							userId: ctx.user.id,
						})
					}
				})
			}

			return { success: true }
		}),

	getAllUnitProgress: protectedProcedure
		.input(z.object({ unitIds: z.array(z.string().uuid()) }))
		.query(async ({ ctx, input }) => {
			if (input.unitIds.length === 0) {
				return []
			}

			// playerId should be userId (from auth) not userProfile.id
			const playerId = ctx.user.id

			const progress = await ctx.db.query.unitProgress.findMany({
				where: (progress, { eq, and, inArray }) =>
					and(
						eq(progress.playerId, playerId),
						inArray(progress.unitId, input.unitIds),
					),
			})

			return progress
		}),

	getUnitProgress: protectedProcedure
		.input(z.object({ unitId: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			// playerId should be userId (from auth) not userProfile.id
			const playerId = ctx.user.id

			const progress = await ctx.db.query.unitProgress.findFirst({
				where: (progress, { eq, and }) =>
					and(
						eq(progress.playerId, playerId),
						eq(progress.unitId, input.unitId),
					),
			})

			return progress
		}),

	getUnitWithGames: protectedProcedure
		.input(z.object({ unitId: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			const unit = await ctx.db.query.units.findFirst({
				where: (units, { eq }) => eq(units.id, input.unitId),
				with: {
					games: {
						orderBy: (games, { asc }) => [asc(games.orderIndex)],
					},
				},
			})

			return unit
		}),
})
