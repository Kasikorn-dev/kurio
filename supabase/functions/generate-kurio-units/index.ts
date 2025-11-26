// Supabase Edge Function: Generate Kurio Units and Games
// This function handles 2-phase generation:
// Phase 1: Generate unit titles (fast)
// Phase 2: Generate games for each unit (background, parallel)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import postgres from "https://deno.land/x/postgresjs@v3.4.3/mod.js"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Types
type Resource = {
	resourceType: "text" | "file" | "image"
	resourceContent?: string
	resourceFileUrl?: string
}

type Game = {
	title: string
	gameType: "quiz" | "matching" | "fill_blank" | "multiple_choice"
	difficultyLevel: "easy" | "medium" | "hard"
	content: Record<string, unknown>
}

// OpenAI Helper Functions (standalone for Edge Function)
async function createOpenAICall<T extends object>(params: {
	model: string
	prompt: string
	imageUrls: string[]
	fileUrls: string[]
	openaiApiKey: string
}): Promise<T> {
	const { model, prompt, imageUrls, fileUrls, openaiApiKey } = params

	const messages: Array<{
		role: string
		content:
			| string
			| Array<{ type: string; text?: string; image_url?: { url: string } }>
	}> = [
		{
			role: "system",
			content:
				"You are an educational content generator. Create appropriate, age-appropriate educational content.",
		},
	]

	if (imageUrls.length > 0 || fileUrls.length > 0) {
		messages.push({
			role: "user",
			content: [
				{ type: "text", text: prompt },
				...imageUrls.map((url) => ({
					type: "image_url",
					image_url: { url },
				})),
				...fileUrls.map((url) => ({
					type: "text",
					text: `\n\nFile URL to analyze: ${url}\nPlease extract and use the actual content from this file.`,
				})),
			],
		})
	} else {
		messages.push({
			role: "user",
			content: prompt,
		})
	}

	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${openaiApiKey}`,
		},
		body: JSON.stringify({
			model,
			messages,
			response_format: { type: "json_object" },
		}),
	})

	if (!response.ok) {
		const error = await response.text()
		throw new Error(`OpenAI API error: ${error}`)
	}

	const data = await response.json()
	const content = data.choices?.[0]?.message?.content

	if (!content) {
		throw new Error("No response from AI")
	}

	return JSON.parse(content) as T
}

function extractTextContent(resources: Resource[]): string {
	return resources
		.filter((r) => r.resourceType === "text" && r.resourceContent)
		.map((r) => r.resourceContent)
		.join("\n\n")
}

function extractFileUrls(resources: Resource[]): string[] {
	return resources
		.filter((r) => r.resourceType === "file" && r.resourceFileUrl)
		.map((r) => r.resourceFileUrl as string)
}

function extractImageUrls(resources: Resource[]): string[] {
	return resources
		.filter((r) => r.resourceType === "image" && r.resourceFileUrl)
		.map((r) => r.resourceFileUrl as string)
}

function buildTextContent(textContent: string, fileUrls: string[]): string {
	let content = textContent
	if (fileUrls.length > 0) {
		content += `\n\nFile URLs to analyze: ${fileUrls.join(", ")}`
	}
	return content
}

// Phase 1: Generate Unit Titles Only
async function generateUnitTitlesOnly(params: {
	resources: Resource[]
	unitCount: number
	openaiApiKey: string
	aiModel?: string
}): Promise<{ titles: string[] }> {
	const { resources, unitCount, openaiApiKey, aiModel = "gpt-4o-mini" } = params

	const textContent = extractTextContent(resources)
	const fileUrls = extractFileUrls(resources)
	const imageUrls = extractImageUrls(resources)
	const fullTextContent = buildTextContent(textContent, fileUrls)

	const prompt = `Create ${unitCount} educational unit titles (ONLY TITLES, NO GAMES) from this content:

${fullTextContent}
${fileUrls.length > 0 ? `\n\nIMPORTANT: Analyze the provided file(s) (PDF/document) and extract all relevant content. Create unit titles based on the actual content structure.` : ""}
${imageUrls.length > 0 ? "\nAnalyze provided images for context.\n" : ""}

Requirements:
- Exactly ${unitCount} unique, descriptive titles
- NO "Unit 1:", "Unit 2:", or numbering prefixes
- Progressive and sequential (each builds on previous)
- NO duplicates - each title must be unique
- Each title should represent a distinct learning topic
- Titles should flow logically from basic to advanced

Return JSON:
{
  "titles": ["Title 1", "Title 2", ..., "Title ${unitCount}"]
}`

	const response = await createOpenAICall<{ titles: string[] }>({
		model: aiModel,
		prompt,
		imageUrls,
		fileUrls,
		openaiApiKey,
	})

	if (
		!response.titles ||
		!Array.isArray(response.titles) ||
		response.titles.length !== unitCount
	) {
		throw new Error(
			`Failed to generate ${unitCount} unit titles. Got ${response.titles?.length ?? 0} titles.`,
		)
	}

	return {
		titles: response.titles.map((title) => title.trim()),
	}
}

// Phase 2: Generate Games for a Unit
async function generateGamesForUnit(params: {
	resources: Resource[]
	unitTitle: string
	unitIndex: number
	totalUnits: number
	allUnitTitles: string[]
	gamesPerUnit: number
	openaiApiKey: string
	aiModel?: string
}): Promise<{ games: Game[] }> {
	const {
		resources,
		unitTitle,
		unitIndex,
		totalUnits,
		allUnitTitles,
		gamesPerUnit,
		openaiApiKey,
		aiModel = "gpt-4o-mini",
	} = params

	const textContent = extractTextContent(resources)
	const fileUrls = extractFileUrls(resources)
	const imageUrls = extractImageUrls(resources)
	const fullTextContent = buildTextContent(textContent, fileUrls)

	const allTitlesContext = allUnitTitles
		.map((title, idx) => `${idx + 1}. ${title}`)
		.join("\n")

	const prompt = `Create ${gamesPerUnit} educational games for this unit:

Unit: "${unitTitle}"
Position: Unit ${unitIndex + 1} of ${totalUnits}

All Units in Course (for context continuity):
${allTitlesContext}

IMPORTANT: 
- Games must build on previous units' content progressively
- Content must be sequential and continuous
- NO duplicate content from previous units
- Each game should advance the learning from previous units

${fullTextContent}
${fileUrls.length > 0 ? `\n\nIMPORTANT: Analyze the provided file(s) and extract all relevant content. Use the actual content from the file(s) to create educational games.` : ""}

Create exactly ${gamesPerUnit} games:
- Mix: quiz, matching, fill_blank, multiple_choice (distribute evenly)
- Difficulty: easy, medium, hard (distribute evenly)
- Progressive content building on previous units

Game Schemas:
MULTIPLE_CHOICE: {"title": "...", "gameType": "multiple_choice", "difficultyLevel": "easy|medium|hard", "content": {"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0}}
QUIZ: {"title": "...", "gameType": "quiz", "difficultyLevel": "easy|medium|hard", "content": {"question": "...", "correctAnswer": "..."}}
FILL_BLANK: {"title": "...", "gameType": "fill_blank", "difficultyLevel": "easy|medium|hard", "content": {"text": "... ___ ...", "blanks": [{"answer": "..."}]}}
MATCHING: {"title": "...", "gameType": "matching", "difficultyLevel": "easy|medium|hard", "content": {"leftItems": ["..."], "rightItems": ["..."], "correctPairs": [{"left": "...", "right": "..."}]}}

Return JSON:
{
  "games": [/* exactly ${gamesPerUnit} games */]
}`

	const response = await createOpenAICall<{ games: Game[] }>({
		model: aiModel,
		prompt,
		imageUrls,
		fileUrls,
		openaiApiKey,
	})

	if (!response.games || !Array.isArray(response.games)) {
		throw new Error("Failed to generate games array")
	}

	if (response.games.length !== gamesPerUnit) {
		throw new Error(
			`Expected ${gamesPerUnit} games, got ${response.games.length}`,
		)
	}

	return response
}

// Generate Course Title and Description
async function generateCourseMetadata(params: {
	resources: Resource[]
	unitTitles: string[]
	openaiApiKey: string
	aiModel?: string
}): Promise<{ title: string; description: string }> {
	const {
		resources,
		unitTitles,
		openaiApiKey,
		aiModel = "gpt-4o-mini",
	} = params

	const textContent = extractTextContent(resources)
	const fileUrls = extractFileUrls(resources)
	const imageUrls = extractImageUrls(resources)
	const fullTextContent = buildTextContent(textContent, fileUrls)

	const unitTitlesContext = unitTitles
		.map((title, idx) => `${idx + 1}. ${title}`)
		.join("\n")

	const prompt = `Based on this educational content and unit structure, create a compelling course title and description:

Content:
${fullTextContent}
${fileUrls.length > 0 ? `\n\nIMPORTANT: Analyze the provided file(s) (PDF/document) and extract all relevant content.` : ""}
${imageUrls.length > 0 ? "\nAnalyze provided images for context.\n" : ""}

Unit Structure:
${unitTitlesContext}

Requirements:
- Title: Short, engaging, and descriptive (max 60 characters)
- Description: 2-3 sentences explaining what students will learn (max 200 characters)
- Title should capture the essence of the entire course
- Description should summarize the learning journey across all units
- Make it appealing and educational

Return JSON:
{
  "title": "Course Title Here",
  "description": "Course description here..."
}`

	const response = await createOpenAICall<{
		title: string
		description: string
	}>({
		model: aiModel,
		prompt,
		imageUrls,
		fileUrls,
		openaiApiKey,
	})

	if (!response.title || !response.description) {
		throw new Error("Failed to generate course metadata")
	}

	return {
		title: response.title.trim(),
		description: response.description.trim(),
	}
}

serve(async (req) => {
	try {
		const { kurioId, resources, unitCount, gamesPerUnit, userId, aiModel } =
			await req.json()

		if (!kurioId || !resources || !unitCount || !gamesPerUnit || !userId) {
			return new Response(
				JSON.stringify({ error: "Missing required parameters" }),
				{ status: 400, headers: { "Content-Type": "application/json" } },
			)
		}

		// Create Supabase Admin Client
		const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
		const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
		const databaseUrl = Deno.env.get("SUPABASE_DB_URL") ?? ""
		const openaiApiKey = Deno.env.get("OPENAI_API_KEY") ?? ""

		if (!supabaseUrl || !supabaseServiceKey || !databaseUrl || !openaiApiKey) {
			return new Response(
				JSON.stringify({ error: "Missing environment variables" }),
				{ status: 500, headers: { "Content-Type": "application/json" } },
			)
		}

		const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

		console.log("databaseUrl", databaseUrl)
		// Create Database Connection
		const sql = postgres(databaseUrl)

		// Import schemas (simplified - using raw SQL for Edge Function)
		// In production, you might want to use a shared schema package

		console.log("PHASE 1: Generate Unit Titles")
		// ===== PHASE 1: Generate Unit Titles (FAST) =====
		const { titles } = await generateUnitTitlesOnly({
			resources,
			unitCount,
			openaiApiKey,
			aiModel,
		})

		console.log("PHASE 1: Generate Course Title and Description")
		// Generate Course Title and Description (using unit titles for context)
		const { title: courseTitle, description: courseDescription } =
			await generateCourseMetadata({
				resources,
				unitTitles: titles,
				openaiApiKey,
				aiModel,
			})

		// Insert units immediately (using raw SQL for simplicity in Edge Function)
		console.log("PHASE 1: Insert Units")
		const insertedUnits: Array<{
			id: string
			title: string
			orderIndex: number
		}> = []
		for (let i = 0; i < titles.length; i++) {
			const [unit] = await sql`
        INSERT INTO unit (kurio_id, title, order_index, status, created_at)
        VALUES (${kurioId}, ${titles[i]}, ${i}, 'generating', NOW())
        RETURNING id, title, order_index
      `
			insertedUnits.push(unit)

			// Broadcast Realtime update
			await supabaseAdmin.channel(`kurio:${kurioId}`).httpSend({
				type: "broadcast",
				event: "unit_created",
				payload: { unitId: unit.id, title: unit.title, index: i },
			})
		}

		// Update kurio with AI-generated title and description
		await sql`
      UPDATE kurio 
      SET 
        title = ${courseTitle},
        description = ${courseDescription},
        status = 'generating_games',
        unit_count = ${unitCount},
        updated_at = NOW()
      WHERE id = ${kurioId}
    `

		// Broadcast: Course metadata updated
		await supabaseAdmin.channel(`kurio:${kurioId}`).httpSend({
			type: "broadcast",
			event: "course_metadata_updated",
			payload: { title: courseTitle, description: courseDescription },
		})

		// Broadcast: All units created
		await supabaseAdmin.channel(`kurio:${kurioId}`).httpSend({
			type: "broadcast",
			event: "units_complete",
			payload: { unitCount },
		})

		console.log("PHASE 2: Generate Games")
		// ===== PHASE 2: Generate Games (BACKGROUND - PARALLEL) =====
		const gamePromises = insertedUnits.map(async (unit, index) => {
			try {
				const { games } = await generateGamesForUnit({
					resources,
					unitTitle: unit.title,
					unitIndex: index,
					totalUnits: unitCount,
					allUnitTitles: titles,
					gamesPerUnit,
					openaiApiKey,
					aiModel,
				})

				// Insert games
				for (let gameIndex = 0; gameIndex < games.length; gameIndex++) {
					const game = games[gameIndex]
					if (!game) continue
					await sql`
            INSERT INTO game (unit_id, title, game_type, difficulty_level, content, order_index, created_at)
            VALUES (
              ${unit.id},
              ${game.title},
              ${game.gameType},
              ${game.difficultyLevel},
              ${JSON.stringify(game.content)}::jsonb,
              ${gameIndex},
              NOW()
            )
          `
				}

				// Update unit status
				await sql`
          UPDATE unit 
          SET status = 'ready' 
          WHERE id = ${unit.id}
        `

				// Broadcast Realtime update
				await supabaseAdmin.channel(`kurio:${kurioId}`).httpSend({
					type: "broadcast",
					event: "unit_games_complete",
					payload: {
						unitId: unit.id,
						gameCount: games.length,
						progress: ((index + 1) / unitCount) * 100,
					},
				})

				return { unitId: unit.id, gameCount: games.length }
			} catch (error) {
				// Update unit status to error
				await sql`
          UPDATE unit 
          SET status = 'error' 
          WHERE id = ${unit.id}
        `
				throw error
			}
		})

		console.log("PHASE 2: Wait for all games")
		// Wait for all games (parallel)
		await Promise.all(gamePromises)

		// Calculate total games
		const totalGames = unitCount * gamesPerUnit

		// Update kurio status to ready
		await sql`
      UPDATE kurio 
      SET status = 'ready', total_games = ${totalGames}, updated_at = NOW()
      WHERE id = ${kurioId}
    `

		// Broadcast: Complete
		await supabaseAdmin.channel(`kurio:${kurioId}`).httpSend({
			type: "broadcast",
			event: "generation_complete",
			payload: { kurioId },
		})

		// Cleanup
		await sql.end()

		return new Response(JSON.stringify({ success: true, kurioId }), {
			headers: { "Content-Type": "application/json" },
		})
	} catch (error) {
		console.error("Edge Function error:", error)
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : "Unknown error",
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		)
	}
})
