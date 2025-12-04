// Supabase Edge Function: Generate Kurio Units and Games
// =========================================================
// This function generates educational content using AI in 3 phases:
// Phase 1: Generate Kurio info (title, description) - User sees this immediately
// Phase 2: Generate Unit titles - Fast, creates structure
// Phase 3: Generate Games for each unit - Parallel processing
//
// Progress is tracked in the database, not just via Realtime broadcasts
// This makes it more reliable and allows clients to poll for updates

import { createDatabaseConnection } from "../utils/db.ts"
import { log, serve } from "../utils/other.ts"
import { processResources } from "../utils/resources.ts"
import {
	insertUnits,
	markKurioAsComplete,
	updateKurioAfterUnitsCreated,
	updateKurioWithTitleAndDescription,
} from "./services/db.ts"
import {
	generateGamesForAllUnits,
	generateKurioInfo,
	generateUnitTitlesAndDescriptions,
	insertGamesAndUpdateStatuses,
} from "./services/generator.ts"
import type { GenerationParams } from "./types.ts"

serve(async (req) => {
	try {
		// Parse request body
		const {
			kurioId,
			resources,
			unitCount,
			gamesPerUnit,
			userId,
		}: GenerationParams = await req.json()
		// Validate required parameters
		if (!kurioId || !resources || !unitCount || !gamesPerUnit || !userId) {
			return new Response(
				JSON.stringify({ error: "Missing required parameters" }),
				{ status: 400, headers: { "Content-Type": "application/json" } },
			)
		}
		// Create database connection
		const sql = createDatabaseConnection()
		try {
			const processedResources = processResources(resources)
			// ===================================================================
			// PHASE 1: Kurio (title, description) and Units (titles, descriptions) Generated
			// ===================================================================
			log("Phase 1 Starting")
			const [kurioResult, unitResult] = await Promise.all([
				generateKurioInfo({
					processedResources,
				}),
				generateUnitTitlesAndDescriptions({
					processedResources,
					unitCount,
				}),
			])
			log("Phase 1 Done")

			// ===================================================================
			// PHASE 2: Update Kurio and insert Units
			// ===================================================================
			log("Phase 2 Starting")
			const { title: kurioTitle, description: kurioDescription } = kurioResult
			await updateKurioWithTitleAndDescription({
				kurioId,
				title: kurioTitle,
				description: kurioDescription,
			})

			const { titles: unitTitles, descriptions: unitDescriptions } = unitResult
			const insertedUnits = await insertUnits({
				kurioId,
				titles: unitTitles,
				descriptions: unitDescriptions,
			})
			await updateKurioAfterUnitsCreated({
				kurioId,
				unitCount,
			})

			log("Phase 2 Done")
			// ===================================================================
			// PHASE 3: Generate Games for All Units (Parallel)
			// ===================================================================
			log("Phase 3 Starting")
			const { successfulUnits, failedUnitIds } = await generateGamesForAllUnits(
				{
					insertedUnits,
					processedResources,
					kurioTitle,
					kurioDescription,
					unitTitles,
					gamesPerUnit,
				},
			)
			// Insert games and update statuses using batch operations
			const { totalGamesInserted } = await insertGamesAndUpdateStatuses({
				successfulUnits,
				failedUnitIds,
			})
			// Mark kurio as complete (includes progress and units completed)
			await markKurioAsComplete({
				kurioId,
				totalGames: totalGamesInserted,
				unitsCompleted: successfulUnits.length,
			})
			log("Phase 3 Done")
			log("=== SUCCESS ===", {
				kurioId,
				successfulUnits: successfulUnits.length,
				failedUnits: failedUnitIds.length,
				totalGames: totalGamesInserted,
			})
			return new Response(
				JSON.stringify({
					success: true,
					kurioId,
					successfulUnits: successfulUnits.length,
					failedUnits: failedUnitIds.length,
					totalGames: totalGamesInserted,
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } },
			)
		} catch (error) {
			log("Edge Function error", { error })
			return new Response(
				JSON.stringify({
					error: error instanceof Error ? error.message : "Unknown error",
				}),
				{ status: 500, headers: { "Content-Type": "application/json" } },
			)
		} finally {
			// Always cleanup database connection
			await sql.end()
		}
	} catch (error) {
		log("Edge Function error", { error })
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : "Unknown error",
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		)
	}
})
