/**
 * Background generation logic for Kurio units
 * Separated from kurio.ts for better organization and testability
 */

import { eq } from "drizzle-orm"
import {
	generateCourseMetadata,
	generateSingleUnit,
} from "@/lib/ai/game-generator"
import type { Resource } from "@/lib/ai/resource-utils"
import { AI_CONSTANTS } from "@/lib/constants"
import type { db } from "@/server/db"
import { kurios } from "@/server/db/schemas"
import { insertSingleUnitAndGames } from "./game-helpers"

type GenerationParams = {
	database: typeof db
	kurioId: string
	resources: Resource[]
	aiModel: string
	totalUnitCount: number
}

/**
 * Generate units in the background
 */
export async function generateKurioUnitsInBackground(
	params: GenerationParams,
): Promise<void> {
	const { database, kurioId, resources, aiModel, totalUnitCount } = params

	let courseTitle: string | undefined
	let courseDescription: string | undefined
	let totalGames = 0
	let hasError = false
	const unitTitles: string[] = []
	const previousUnits: Array<{
		title: string
		sampleGames: Array<{
			title: string
			gameType: string
			content: Record<string, unknown>
		}>
	}> = []

	try {
		// Generate units sequentially
		for (let unitIndex = 0; unitIndex < totalUnitCount; unitIndex++) {
			try {
				// Generate single unit with previous units context
				const unitData = await generateSingleUnit({
					resources,
					aiModel,
					gamesPerUnit: AI_CONSTANTS.GAMES_PER_UNIT,
					courseTitle,
					unitIndex,
					totalUnits: totalUnitCount,
					previousUnits: previousUnits.length > 0 ? previousUnits : undefined,
				})

				// Validate unit title before storing
				const unitTitle = unitData.title?.trim()
				if (!unitTitle || unitTitle.length === 0) {
					throw new Error(`Unit ${unitIndex + 1} has empty title`)
				}

				// Store unit title for course metadata generation
				unitTitles.push(unitTitle)

				// Insert unit and games immediately
				const { gameCount } = await insertSingleUnitAndGames(
					database,
					kurioId,
					unitData,
					unitIndex,
				)

				totalGames += gameCount

				// Store unit context for next unit generation
				// Take first 2 games as sample for context (reduced for faster generation)
				const sampleGames = unitData.games.slice(0, 2).map((game) => ({
					title: game.title,
					gameType: game.gameType,
					content: game.content,
				}))
				previousUnits.push({
					title: unitTitle,
					sampleGames,
				})

				// Generate course title and description after first unit
				if (unitIndex === 0 && unitTitles.length > 0) {
					const firstUnitTitle = unitTitles[0]
					if (firstUnitTitle) {
						try {
							const courseMetadata = await generateCourseMetadata({
								resources,
								aiModel,
								unitTitles: [firstUnitTitle], // Use first unit title for initial metadata
							})
							courseTitle = courseMetadata.title
							courseDescription = courseMetadata.description

							// Update kurio title and description immediately
							await database
								.update(kurios)
								.set({
									title: courseTitle,
									description: courseDescription ?? null,
									totalGames: totalGames,
									updatedAt: new Date(),
								})
								.where(eq(kurios.id, kurioId))
						} catch (metadataError) {
							console.error(
								"Failed to generate course metadata:",
								metadataError,
							)
							// Use fallback title if metadata generation fails
							courseTitle = courseTitle ?? "Course"
							await database
								.update(kurios)
								.set({
									title: courseTitle,
									totalGames: totalGames,
									updatedAt: new Date(),
								})
								.where(eq(kurios.id, kurioId))
						}
					}
				} else {
					// Update kurio with progress only (title already set)
					await database
						.update(kurios)
						.set({
							totalGames: totalGames,
							updatedAt: new Date(),
						})
						.where(eq(kurios.id, kurioId))
				}
			} catch (unitError) {
				console.error(`Failed to generate unit ${unitIndex + 1}:`, unitError)
				// Continue with next unit even if one fails
				hasError = true
			}
		}

		// Update kurio status to ready
		await database
			.update(kurios)
			.set({
				status: hasError && totalGames === 0 ? "error" : "ready",
				updatedAt: new Date(),
			})
			.where(eq(kurios.id, kurioId))
	} catch (error) {
		// Update status to error if generation fails completely
		console.error("Background generation error:", error)
		await database
			.update(kurios)
			.set({
				status: "error",
				updatedAt: new Date(),
			})
			.where(eq(kurios.id, kurioId))
			.catch((updateError) => {
				console.error("Failed to update kurio status:", updateError)
			})
	}
}
