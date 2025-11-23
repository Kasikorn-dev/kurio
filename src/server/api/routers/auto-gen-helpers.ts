import { eq } from "drizzle-orm"

import { generateGameContent } from "@/lib/ai/game-generator"
import { AI_CONSTANTS } from "@/lib/constants"
import {
	calculateCompletedGames,
	calculateKurioProgress,
	shouldTriggerAutoGen,
} from "@/lib/kurio/progress-calculator"
import { db } from "@/server/db"
import { kurios } from "@/server/db/schemas"
import { batchInsertUnitsAndGames } from "./game-helpers"

type AutoGenResult = {
	generated: boolean
	reason?: string
	progress?: number
	unitsAdded?: number
	gamesAdded?: number
	message?: string
}

/**
 * Check if auto-gen should trigger and generate new units if needed
 * This is a standalone function that can be called from anywhere
 */
export async function checkAndGenerateUnits(
	database: typeof db,
	kurioId: string,
	userId: string,
): Promise<AutoGenResult> {
	// Fetch kurio with units and progress
	const kurio = await database.query.kurios.findFirst({
		where: (kurios, { eq }) => eq(kurios.id, kurioId),
		with: {
			units: {
				with: {
					progress: {
						where: (progress, { eq }) => eq(progress.playerId, userId),
					},
				},
			},
			resources: {
				orderBy: (resources, { asc }) => [asc(resources.orderIndex)],
			},
		},
	})

	if (!kurio) {
		throw new Error("Kurio not found")
	}

	if (kurio.userId !== userId) {
		throw new Error("Unauthorized")
	}

	// Only proceed if auto-gen is enabled
	if (!kurio.autoGenEnabled) {
		return { generated: false, reason: "Auto-gen is not enabled" }
	}

	// Calculate progress
	const totalGames = kurio.totalGames
	const completedGames = calculateCompletedGames(
		kurio.units.flatMap((unit) => unit.progress),
	)

	const progressPercentage = calculateKurioProgress({
		totalUnits: kurio.units.length,
		completedUnits: kurio.units.filter((u) =>
			u.progress.some((p) => p.isCompleted),
		).length,
		totalGames,
		completedGames,
	})

	// Check if we should trigger auto-gen
	const threshold = kurio.autoGenThreshold
	const hasTriggered = kurio.hasAutoGenTriggered

	if (!shouldTriggerAutoGen(progressPercentage, threshold, hasTriggered)) {
		return {
			generated: false,
			reason: hasTriggered
				? "Auto-gen has already been triggered"
				: `Progress is ${progressPercentage}%, threshold is ${threshold}%`,
			progress: progressPercentage,
		}
	}

	// Generate additional units
	try {
		// Validate that we have resources to generate from
		if (kurio.resources.length === 0) {
			throw new Error(
				"Cannot generate additional units: No resources available",
			)
		}

                const gameContent = await generateGameContent({
                        resources: kurio.resources.map((r) => ({
                                resourceType: r.resourceType,
                                resourceContent: r.resourceContent ?? undefined,
                                resourceFileUrl: r.resourceFileUrl ?? undefined,
                        })),
                        aiModel: kurio.aiModel,
                        unitCount: AI_CONSTANTS.AUTO_GEN.ADDITIONAL_UNITS,
                        gamesPerUnit: AI_CONSTANTS.GAMES_PER_UNIT,
                })

		// Get current max order index
		const maxOrderIndex = Math.max(
			...kurio.units.map((u) => u.orderIndex),
			-1,
		)

		// Adjust order indices for new units
                const adjustedUnits = gameContent.content.units.map((unit, index) => ({
                        ...unit,
                        orderIndex: maxOrderIndex + 1 + index,
                }))

		// Batch insert new units and games
		const newGames = await batchInsertUnitsAndGames(
			database,
			kurio.id,
			adjustedUnits,
		)

		// Update kurio with new total and mark auto-gen as triggered
		await database
			.update(kurios)
			.set({
				totalGames: totalGames + newGames,
				hasAutoGenTriggered: true,
				updatedAt: new Date(),
			})
			.where(eq(kurios.id, kurio.id))

		return {
			generated: true,
			unitsAdded: AI_CONSTANTS.AUTO_GEN.ADDITIONAL_UNITS,
			gamesAdded: newGames,
			progress: progressPercentage,
			message: `Successfully generated ${AI_CONSTANTS.AUTO_GEN.ADDITIONAL_UNITS} new units with ${newGames} games!`,
		}
	} catch (error) {
		// Log the error for debugging
		console.error("Auto-gen generation error:", error)

		// Return user-friendly error
		const errorMessage =
			error instanceof Error
				? error.message
				: "Unknown error occurred during generation"

		throw new Error(
			`Failed to generate additional units: ${errorMessage}. Your progress has been saved.`,
		)
	}
}
