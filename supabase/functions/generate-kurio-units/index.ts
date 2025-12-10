// Supabase Edge Function: Generate Kurio Units and Games
// =========================================================
// This function generates educational content using AI in 4 phases:
// Phase 0: Pre-process Resources - Summarize and create structure
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
	// markKurioAsComplete, // Used in PHASE 3 (commented out)
	updateKurioAfterUnitsCreated,
	updateKurioWithPreprocessedData,
	updateKurioWithTitleAndDescription,
} from "./services/db.ts"
import {
	// generateGamesForAllUnitsWithSummary, // Used in PHASE 3 (commented out)
	generateKurioInfoWithSummary,
	generateUnitTitlesAndDescriptionsWithSummary,
	// insertGamesAndUpdateStatuses, // Used in PHASE 3 (commented out)
	preprocessResources,
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
			// PHASE 0: Pre-process Resources (สรุปและสร้างโครงสร้าง)
			// ===================================================================
			log("Phase 0 Starting: Pre-processing Resources")
			const phase0StartTime = performance.now()
			const { summary } = await preprocessResources({
				processedResources,
			})

			// เก็บ summary ใน DB
			await updateKurioWithPreprocessedData({
				kurioId,
				summary,
			})
			const phase0Duration = (performance.now() - phase0StartTime) / 1000
			log("Phase 0 Done: Summary saved to DB", {
				duration: `${phase0Duration.toFixed(2)}s`,
			})

			// ===================================================================
			// PHASE 1: Generate Kurio & Units (ใช้ summary แทน full content)
			// ===================================================================
			log("Phase 1 Starting: Generate Kurio & Units")
			const phase1StartTime = performance.now()
			const [kurioResult, unitResult] = await Promise.all([
				generateKurioInfoWithSummary({
					summary,
				}),
				generateUnitTitlesAndDescriptionsWithSummary({
					summary,
					unitCount,
				}),
			])
			const phase1Duration = (performance.now() - phase1StartTime) / 1000
			log("Phase 1 Done", {
				duration: `${phase1Duration.toFixed(2)}s`,
			})

			// ===================================================================
			// PHASE 2: Update Kurio and insert Units
			// ===================================================================
			log("Phase 2 Starting")
			const phase2StartTime = performance.now()
			const { title: kurioTitle, description: kurioDescription } = kurioResult
			await updateKurioWithTitleAndDescription({
				kurioId,
				title: kurioTitle,
				description: kurioDescription,
				unitCount,
			})

			const { titles: unitTitles, descriptions: unitDescriptions } = unitResult
			const insertedUnits = await insertUnits({
				kurioId,
				titles: unitTitles,
				descriptions: unitDescriptions,
			})
			await updateKurioAfterUnitsCreated({
				kurioId,
			})
			const phase2Duration = (performance.now() - phase2StartTime) / 1000
			log("Phase 2 Done", {
				duration: `${phase2Duration.toFixed(2)}s`,
			})

			// ===================================================================
			// PHASE 3: Generate Games (ใช้ summary แทน full content)
			// ===================================================================
			// TODO: Comment out game generation temporarily to measure timing
			/*
			log("Phase 3 Starting: Generate Games")
			const phase3StartTime = performance.now()
			const { successfulUnits, failedUnitIds } =
				await generateGamesForAllUnitsWithSummary({
					insertedUnits,
					summary,
					structure,
					unitTitles,
					gamesPerUnit,
					processedResources,
				})
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
			const phase3Duration = (performance.now() - phase3StartTime) / 1000
			log("Phase 3 Done", {
				duration: `${phase3Duration.toFixed(2)}s`,
			})
			*/

			const overallDuration = (performance.now() - overallStartTime) / 1000
			log("=== SUCCESS (Phase 0-2 Complete) ===", {
				kurioId,
				unitsCreated: insertedUnits.length,
				timing: {
					phase0: `${phase0Duration.toFixed(2)}s`,
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
					message:
						"Phase 0-2 complete. Game generation commented out for timing measurement.",
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
