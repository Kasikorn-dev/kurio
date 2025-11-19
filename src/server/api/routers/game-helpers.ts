import { and, eq } from "drizzle-orm"
import type { db } from "@/server/db"
import { games, unitProgress, units } from "@/server/db/schemas"

// Type that accepts both database and transaction
// Extract the transaction parameter type to get a compatible type
type Database = Parameters<Parameters<typeof db.transaction>[0]>[0] | typeof db

/**
 * Get user profile ID from user ID
 * This is a common pattern that could be cached or optimized
 */
export async function getUserProfileId(
	database: Database,
	userId: string,
): Promise<string> {
	const userProfile = await database.query.userProfiles.findFirst({
		where: (profiles, { eq }) => eq(profiles.userId, userId),
	})

	if (!userProfile) {
		throw new Error("User profile not found")
	}

	return userProfile.id
}

/**
 * Update or create unit progress for a player
 */
export async function upsertUnitProgress(
	database: Database,
	playerId: string,
	unitId: string,
	totalGames: number,
): Promise<void> {
	const existingProgress = await database.query.unitProgress.findFirst({
		where: (progress, { eq, and }) =>
			and(eq(progress.playerId, playerId), eq(progress.unitId, unitId)),
	})

	if (existingProgress) {
		await database
			.update(unitProgress)
			.set({
				completedGames: existingProgress.completedGames + 1,
				isCompleted:
					existingProgress.completedGames + 1 >= existingProgress.totalGames,
				lastPlayedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(unitProgress.playerId, playerId),
					eq(unitProgress.unitId, unitId),
				),
			)
	} else {
		await database.insert(unitProgress).values({
			playerId,
			unitId,
			completedGames: 1,
			totalGames,
			isCompleted: 1 >= totalGames,
			lastPlayedAt: new Date(),
		})
	}
}

/**
 * Batch insert units and games for better performance
 */
type UnitData = {
	title: string
	games: Array<{
		title: string
		gameType: "quiz" | "matching" | "fill_blank" | "multiple_choice"
		difficultyLevel: "easy" | "medium" | "hard"
		content: Record<string, unknown>
	}>
}

export async function batchInsertUnitsAndGames(
	database: Database,
	kurioId: string,
	unitsData: UnitData[],
): Promise<number> {
	let totalGames = 0

	// Insert all units first in batch
	const unitsToInsert = unitsData.map((unitData, unitIndex) => ({
		kurioId,
		title: unitData.title,
		orderIndex: unitIndex,
	}))

	const insertedUnits = await database
		.insert(units)
		.values(unitsToInsert)
		.returning()

	if (insertedUnits.length !== unitsData.length) {
		throw new Error("Failed to create all units")
	}

	// Prepare all games for batch insert
	const gamesToInsert: Array<{
		unitId: string
		title: string
		gameType: "quiz" | "matching" | "fill_blank" | "multiple_choice"
		content: Record<string, unknown>
		difficultyLevel: "easy" | "medium" | "hard"
		orderIndex: number
	}> = []

	for (let unitIndex = 0; unitIndex < insertedUnits.length; unitIndex++) {
		const unit = insertedUnits[unitIndex]
		const unitData = unitsData[unitIndex]

		if (!unit || !unitData) {
			continue
		}

		for (let gameIndex = 0; gameIndex < unitData.games.length; gameIndex++) {
			const gameData = unitData.games[gameIndex]
			if (!gameData) {
				continue
			}

			gamesToInsert.push({
				unitId: unit.id,
				title: gameData.title,
				gameType: gameData.gameType,
				content: gameData.content,
				difficultyLevel: gameData.difficultyLevel,
				orderIndex: gameIndex,
			})
			totalGames++
		}
	}

	// Batch insert all games at once for better performance
	if (gamesToInsert.length > 0) {
		await database.insert(games).values(gamesToInsert)
	}

	return totalGames
}
