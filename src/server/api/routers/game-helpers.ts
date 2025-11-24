import { sql } from "drizzle-orm"
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
 * Update or create unit progress for a player using ON CONFLICT DO UPDATE
 * This is faster than findFirst + update/insert
 * playerId should be userId (from auth) because unit_progress.player_id references user_profile.user_id
 */
export async function upsertUnitProgress(
	database: Database,
	playerId: string, // This is userId from auth, not userProfile.id
	unitId: string,
	totalGames: number,
): Promise<void> {
	await database
		.insert(unitProgress)
		.values({
			playerId, // This is userId from auth
			unitId,
			completedGames: 1,
			totalGames,
			isCompleted: false,
			lastPlayedAt: new Date(),
		})
		.onConflictDoUpdate({
			target: [unitProgress.playerId, unitProgress.unitId],
			set: {
				completedGames: sql`${unitProgress.completedGames} + 1`,
				isCompleted: sql`(${unitProgress.completedGames} + 1) >= ${unitProgress.totalGames}`,
				lastPlayedAt: new Date(),
				updatedAt: new Date(),
			},
		})
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

/**
 * Insert a single unit with its games
 */
export async function insertSingleUnitAndGames(
	database: Database,
	kurioId: string,
	unitData: {
		title: string
		games: Array<{
			title: string
			gameType: "quiz" | "matching" | "fill_blank" | "multiple_choice"
			difficultyLevel: "easy" | "medium" | "hard"
			content: Record<string, unknown>
		}>
	},
	orderIndex: number,
): Promise<{ unitId: string; gameCount: number }> {
	// Validate and sanitize title
	const unitTitle = unitData.title?.trim() || `Unit ${orderIndex + 1}`

	if (!unitTitle || unitTitle.length === 0) {
		throw new Error(`Unit title cannot be empty. Order index: ${orderIndex}`)
	}

	// Insert unit
	const [insertedUnit] = await database
		.insert(units)
		.values({
			kurioId,
			title: unitTitle,
			orderIndex,
		})
		.returning()

	if (!insertedUnit) {
		throw new Error("Failed to create unit")
	}

	// Insert games for this unit
	const gamesToInsert = unitData.games.map((gameData, gameIndex) => ({
		unitId: insertedUnit.id,
		title: gameData.title,
		gameType: gameData.gameType,
		content: gameData.content,
		difficultyLevel: gameData.difficultyLevel,
		orderIndex: gameIndex,
	}))

	if (gamesToInsert.length > 0) {
		await database.insert(games).values(gamesToInsert)
	}

	return {
		unitId: insertedUnit.id,
		gameCount: gamesToInsert.length,
	}
}
