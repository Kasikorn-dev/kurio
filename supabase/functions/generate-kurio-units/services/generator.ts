import { createGeminiCall } from "../../utils/gemini.ts"
import { log } from "../../utils/other.ts"
import type { ProcessedResources } from "../../utils/resources.ts"
import type { Game } from "../types.ts"
import { insertGamesBatch, updateUnitStatusesBatch } from "./db.ts"

// ===================================================================
// TWO-PASS WORKFLOW: Phase 1 - Generate Structure
// ===================================================================

/**
 * Generate complete course structure (Kurio + Units) in one AI call
 * This is Phase 1 of the Two-Pass workflow
 */
export async function generateCourseStructure(params: {
	processedResources: ProcessedResources
	unitCount: number
}): Promise<{
	kurio: { title: string; description: string }
	units: Array<{ title: string; description: string }>
	aiModel: string
}> {
	const { processedResources, unitCount } = params
	const { textContent, imageFilePaths, fileFilePaths } = processedResources

	const prompt = `Create a complete educational course structure from this content:

${textContent}

Generate:
1. Course title (max 60 characters) and description (max 200 characters)
2. ${unitCount} units with titles and descriptions

Requirements:
- Course title should be engaging and descriptive
- Course description should explain what students will learn
- Unit titles: NO "Unit X:" prefix, just the topic name
- Unit descriptions: 1-2 sentences, max 200 characters each
- Units should be progressive (basic to advanced)
- Each unit should be unique and distinct

Return JSON (EXACT FORMAT):
{
  "kurio": {
    "title": "Course Title Here",
    "description": "Course description here..."
  },
  "units": [
    {
      "title": "Unit Title 1",
      "description": "Unit description 1..."
    },
    {
      "title": "Unit Title 2", 
      "description": "Unit description 2..."
    }
  ]
}

IMPORTANT: Return exactly ${unitCount} units.`

	const response = await createGeminiCall<{
		kurio: { title: string; description: string }
		units: Array<{ title: string; description: string }>
		aiModel: string
	}>({
		prompt,
		imageFilePaths,
		fileFilePaths,
	})

	// Validate response
	if (!response.kurio?.title || !response.kurio?.description) {
		throw new Error("Failed to generate kurio info")
	}

	if (!Array.isArray(response.units) || response.units.length !== unitCount) {
		throw new Error(
			`Expected ${unitCount} units, got ${response.units?.length ?? 0}`,
		)
	}

	// Clean titles (remove any unwanted prefixes)
	const cleanedUnits = response.units.map((unit) => ({
		title: unit.title.replace(/^(Unit\s+\d+[:-\s]+)/i, "").trim(),
		description: unit.description.trim(),
	}))

	return {
		kurio: {
			title: response.kurio.title.trim(),
			description: response.kurio.description.trim(),
		},
		units: cleanedUnits,
		aiModel: response.aiModel,
	}
}

// ===================================================================
// TWO-PASS WORKFLOW: Phase 2 - Generate Games
// ===================================================================

/**
 * Generate games for a specific unit
 * This is Phase 2 of the Two-Pass workflow
 */
export async function generateGamesForUnit(params: {
	processedResources: ProcessedResources
	unitTitle: string
	unitDescription: string
	unitIndex: number
	totalUnits: number
	gamesPerUnit: number
}): Promise<{ games: Game[] }> {
	const {
		processedResources,
		unitTitle,
		unitDescription,
		unitIndex,
		totalUnits,
		gamesPerUnit,
	} = params

	const { textContent, imageFilePaths, fileFilePaths } = processedResources

	const prompt = `Create ${gamesPerUnit} educational games for this unit:

Unit ${unitIndex + 1} of ${totalUnits}: "${unitTitle}"
Unit Description: "${unitDescription}"

Content:
${textContent}

Create exactly ${gamesPerUnit} games that test knowledge about "${unitTitle}":
- Mix game types: quiz, matching, fill_blank, multiple_choice
- Mix difficulty: easy, medium, hard
- All content must relate to "${unitTitle}"
- NO "Unit X:" or "Game X:" prefixes in titles
- Progressive difficulty

Game Schemas:

1. QUIZ:
{
  "title": "Game description (no prefixes)",
  "gameType": "quiz",
  "difficultyLevel": "easy|medium|hard",
  "content": {
    "question": "Question about ${unitTitle}?",
    "correctAnswer": "Answer"
  }
}

2. MULTIPLE_CHOICE:
{
  "title": "Game description",
  "gameType": "multiple_choice",
  "difficultyLevel": "easy|medium|hard",
  "content": {
    "question": "Question?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0
  }
}

3. FILL_BLANK:
{
  "title": "Game description",
  "gameType": "fill_blank",
  "difficultyLevel": "easy|medium|hard",
  "content": {
    "text": "Text with ___ blanks",
    "blanks": [{"answer": "word1"}, {"answer": "word2"}]
  }
}

4. MATCHING:
{
  "title": "Game description",
  "gameType": "matching",
  "difficultyLevel": "easy|medium|hard",
  "content": {
    "leftItems": ["Item 1", "Item 2"],
    "rightItems": ["Match 1", "Match 2"],
    "correctPairs": [
      {"left": "Item 1", "right": "Match 1"},
      {"left": "Item 2", "right": "Match 2"}
    ]
  }
}

Return JSON:
{
  "games": [
    { /* game 1 */ },
    { /* game 2 */ },
    ...
  ]
}`

	const response = await createGeminiCall<{ games: Game[] }>({
		prompt,
		imageFilePaths,
		fileFilePaths,
	})

	if (!response.games || !Array.isArray(response.games)) {
		throw new Error("Failed to generate games array")
	}

	if (response.games.length !== gamesPerUnit) {
		throw new Error(
			`Expected ${gamesPerUnit} games, got ${response.games.length}`,
		)
	}

	// Clean game titles
	const cleanedGames = response.games.map((game) => ({
		...game,
		title: game.title
			.replace(/^(Unit\s+\d+[:-\s]+|Game\s+\d+[:-\s]+)/i, "")
			.replace(/\s*\(easy\)|\s*\(medium\)|\s*\(hard\)$/i, "")
			.trim(),
	}))

	return { games: cleanedGames }
}

/**
 * Generate games for all units in parallel
 */
export async function generateGamesForAllUnits(params: {
	insertedUnits: Array<{
		id: string
		title: string
		description: string
		order_index: number
	}>
	processedResources: ProcessedResources
	gamesPerUnit: number
}): Promise<{
	successfulUnits: Array<{ unitId: string; games: Game[] }>
	failedUnitIds: string[]
}> {
	const {
		insertedUnits,
		processedResources,
		gamesPerUnit,
	} = params

	// Generate games for all units in parallel
	const unitResults = await Promise.allSettled(
		insertedUnits.map(async (unit) => {
			const games = await generateGamesForUnit({
				processedResources,
				unitTitle: unit.title,
				unitDescription: unit.description,
				unitIndex: unit.order_index,
				totalUnits: insertedUnits.length,
				gamesPerUnit,
			})

			return {
				unitId: unit.id,
				games: games.games,
			}
		}),
	)

	// Separate successful and failed units
	const successfulUnits: Array<{ unitId: string; games: Game[] }> = []
	const failedUnitIds: string[] = []

	unitResults.forEach((result, index) => {
		if (result.status === "fulfilled") {
			successfulUnits.push(result.value)
		} else {
			const unit = insertedUnits[index]
			if (unit) {
				failedUnitIds.push(unit.id)
				log("Unit game generation failed", {
					unitId: unit.id,
					unitTitle: unit.title,
					error: result.reason,
				})
			}
		}
	})

	return {
		successfulUnits,
		failedUnitIds,
	}
}

/**
 * Insert games and update unit statuses
 */
export async function insertGamesAndUpdateStatuses(params: {
	successfulUnits: Array<{ unitId: string; games: Game[] }>
	failedUnitIds: string[]
}): Promise<{ totalGamesInserted: number }> {
	const { successfulUnits, failedUnitIds } = params

	// Flatten all games
	const gamesToInsert: Array<{
		unitId: string
		title: string
		gameType: string
		difficultyLevel: string
		content: Record<string, unknown>
		orderIndex: number
	}> = []

	successfulUnits.forEach(({ unitId, games }) => {
		games.forEach((game, gameIndex) => {
			if (game?.title && game?.gameType && game?.difficultyLevel) {
				gamesToInsert.push({
					unitId,
					title: game.title,
					gameType: game.gameType,
					difficultyLevel: game.difficultyLevel,
					content: game.content,
					orderIndex: gameIndex,
				})
			}
		})
	})

	// Batch insert games
	if (gamesToInsert.length > 0) {
		await insertGamesBatch(gamesToInsert)
		log("Games batch inserted", { totalGames: gamesToInsert.length })
	}

	// Batch update unit statuses
	if (successfulUnits.length > 0) {
		const successfulUnitIds = successfulUnits.map((u) => u.unitId)
		await updateUnitStatusesBatch(successfulUnitIds, "ready")
		log("Unit statuses updated to ready", {
			successfulUnits: successfulUnitIds.length,
		})
	}

	if (failedUnitIds.length > 0) {
		await updateUnitStatusesBatch(failedUnitIds, "error")
		log("Unit statuses updated to error", {
			failedUnits: failedUnitIds.length,
		})
	}

	return {
		totalGamesInserted: gamesToInsert.length,
	}
}
