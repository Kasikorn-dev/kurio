// Supabase Edge Function: Generate Kurio Units and Games
// =========================================================
// Two-Pass Workflow using Gemini 2.5 Flash-Lite:
// Phase 1: Generate Structure (Kurio + Units) - ~10 seconds
// Phase 2: Generate Games (Parallel) - ~15 seconds
// Total: ~25 seconds

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
	generateCourseStructure,
	generateGamesForAllUnits,
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
			const overallStartTime = performance.now()

			// ===================================================================
			// PHASE 1: Generate Structure (Kurio + Units)
			// ===================================================================
			log("Phase 1 Starting: Generate Structure")
			const phase1StartTime = performance.now()

			const structure = await generateCourseStructure({
				processedResources,
				unitCount,
			})

			const phase1Duration = (performance.now() - phase1StartTime) / 1000
			log("Phase 1 Done", {
				duration: `${phase1Duration.toFixed(2)}s`,
			})

			// Save Kurio
			await updateKurioWithTitleAndDescription({
				kurioId,
				unitCount,
				title: structure.kurio.title,
				description: structure.kurio.description,
				aiModel: structure.aiModel,
			})

			// Save Units
			const insertedUnits = await insertUnits({
				kurioId,
				titles: structure.units.map((u) => u.title),
				descriptions: structure.units.map((u) => u.description),
			})

			await updateKurioAfterUnitsCreated({ kurioId })

			log("Structure saved to DB", {
				kurio: structure.kurio.title,
				units: insertedUnits.length,
			})

			// ===================================================================
			// PHASE 2: Generate Games (Parallel)
			// ===================================================================
			log("Phase 2 Starting: Generate Games")
			const phase2StartTime = performance.now()

			const { successfulUnits, failedUnitIds } = await generateGamesForAllUnits(
				{
					insertedUnits,
					processedResources,
					gamesPerUnit,
				},
			)

			// Insert games and update statuses
			const { totalGamesInserted } = await insertGamesAndUpdateStatuses({
				successfulUnits,
				failedUnitIds,
			})

			// Mark kurio as complete
			await markKurioAsComplete({
				kurioId,
				totalGames: totalGamesInserted,
				unitsCompleted: successfulUnits.length,
			})

			const phase2Duration = (performance.now() - phase2StartTime) / 1000
			log("Phase 2 Done", {
				duration: `${phase2Duration.toFixed(2)}s`,
			})

			const overallDuration = (performance.now() - overallStartTime) / 1000
			log("=== SUCCESS ===", {
				kurioId,
				unitsCreated: insertedUnits.length,
				gamesCreated: totalGamesInserted,
				timing: {
					phase1: `${phase1Duration.toFixed(2)}s`,
					phase2: `${phase2Duration.toFixed(2)}s`,
					total: `${overallDuration.toFixed(2)}s`,
				},
			})

			return new Response(
				JSON.stringify({
					success: true,
					kurioId,
					unitsCreated: insertedUnits.length,
					gamesCreated: totalGamesInserted,
					duration: `${overallDuration.toFixed(2)}s`,
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
