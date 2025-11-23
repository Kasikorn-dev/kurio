import { AI_CONSTANTS } from "@/lib/constants"
import { SAFETY_SYSTEM_PROMPT, validateContentSafety } from "./content-safety"
import { openai } from "./openai-client"

type Resource = {
	resourceType: "text" | "file" | "image"
	resourceContent?: string
	resourceFileUrl?: string
}

type GenerateGameParams = {
	resources: Resource[]
	aiModel?: string
	unitCount: number
	gamesPerUnit: number
}

type GenerateGameResponse = {
	title: string
	description?: string
	units: Array<{
		title: string
		games: Array<{
			title: string
			gameType: "quiz" | "matching" | "fill_blank" | "multiple_choice"
			difficultyLevel: "easy" | "medium" | "hard"
			content: Record<string, unknown>
		}>
	}>
}

export async function generateGameContent(
	params: GenerateGameParams,
): Promise<GenerateGameResponse> {
	const {
		resources,
		aiModel = AI_CONSTANTS.DEFAULT_MODEL,
		unitCount,
		gamesPerUnit,
	} = params

	// Prepare text content
	const textContent = resources
		.map((r) => {
			if (r.resourceType === "text" && r.resourceContent) {
				return r.resourceContent
			}
			return null
		})
		.filter(Boolean)
		.join("\n\n")

	// Validate content safety
	const safetyCheck = validateContentSafety(textContent)
	if (!safetyCheck.safe) {
		throw new Error(
			`Content safety check failed: ${safetyCheck.reason}. Please provide appropriate educational content.`,
		)
	}

	// Prepare image URLs for vision
	const imageUrls = resources
		.filter(
			(r): r is Resource & { resourceFileUrl: string } =>
				r.resourceType === "image" && Boolean(r.resourceFileUrl),
		)
		.map((r) => r.resourceFileUrl)

	const prompt = `Create ${unitCount} educational units with ${gamesPerUnit} games each from this content:

${textContent}
${imageUrls.length > 0 ? "\nAnalyze provided images for additional context.\n" : ""}

Requirements:
- Course title (max 255 chars) - Use a concise, descriptive title WITHOUT "Unit", "Educational Course", or unit count
  Example: "Medical History and Penicillin" NOT "A 30-Unit Educational Course" or "Medical History - 30 Units"
- Optional description (max 500 chars)
- ${unitCount} units, each with ${gamesPerUnit} games
- Mix of game types: quiz, matching, fill_blank, multiple_choice
- Difficulty levels: easy, medium, hard
- Educational and age-appropriate content

CRITICAL NAMING RULES:
- Course title: Use descriptive name WITHOUT "Unit", "Educational Course", "Course", unit count, or similar generic terms
  Example: "Medical History and Penicillin" NOT "A 30-Unit Educational Course"
  Example: "Reading Comprehension Basics" NOT "30-Unit Reading Course"
- Unit titles: Use descriptive names WITHOUT "Unit 1:", "Unit 2:", or any numbering prefix
  Example: "Passage Basics and Main Idea" NOT "Unit 1: Passage Basics and Main Idea"
- Game titles: Use descriptive names WITHOUT game type prefix like "Matching:", "Quiz:", "Fill in:", "Multiple Choice:"
  Example: "terms and ideas" NOT "Matching: terms and ideas"
  Example: "hospital setting" NOT "Quiz: hospital setting"
  Example: "contextual word" NOT "Fill in: contextual word"

IMPORTANT: Each game type MUST follow its exact schema below:

1. MULTIPLE_CHOICE:
{
  "title": "Descriptive question title (NO 'Multiple Choice:' prefix)",
  "gameType": "multiple_choice",
  "difficultyLevel": "easy|medium|hard",
  "content": {
    "question": "The question text",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": 0  // Index of correct option (0-3)
  }
}

2. QUIZ (short answer):
{
  "title": "Descriptive question title (NO 'Quiz:' prefix)",
  "gameType": "quiz",
  "difficultyLevel": "easy|medium|hard",
  "content": {
    "question": "The question text",
    "correctAnswer": "The exact answer"  // String, case-insensitive match
  }
}

3. FILL_BLANK:
{
  "title": "Descriptive exercise title (NO 'Fill in:' or 'Fill Blank:' prefix)",
  "gameType": "fill_blank",
  "difficultyLevel": "easy|medium|hard",
  "content": {
    "text": "The quick ___ jumps over the lazy ___.",  // Use ___ for blanks
    "blanks": [
      {"answer": "brown fox"},  // First blank answer
      {"answer": "dog"}         // Second blank answer
    ]
  }
}

4. MATCHING:
{
  "title": "Descriptive matching title (NO 'Matching:' prefix)",
  "gameType": "matching",
  "difficultyLevel": "easy|medium|hard",
  "content": {
    "leftItems": ["Item 1", "Item 2", "Item 3"],
    "rightItems": ["Match 1", "Match 2", "Match 3"],
    "correctPairs": [
      {"left": "Item 1", "right": "Match 1"},
      {"left": "Item 2", "right": "Match 2"},
      {"left": "Item 3", "right": "Match 3"}
    ]
  }
}

Return JSON in this exact format:
{
  "title": "Course Title (NO 'Unit', 'Educational Course', or unit count)",
  "description": "Brief description (optional)",
  "units": [
    {
      "title": "Descriptive Unit Title (NO 'Unit 1:' prefix)",
      "games": [
        // Games following schemas above
      ]
    }
  ]
}`

	try {
		// Build messages with vision support
		if (imageUrls.length > 0) {
			// Use vision with images
			const completion = await openai.chat.completions.create({
				model: aiModel,
				messages: [
					{
						role: "system",
						content: SAFETY_SYSTEM_PROMPT,
					},
					{
						role: "user",
						content: [
							{ type: "text", text: prompt },
							...imageUrls.map((url) => ({
								type: "image_url" as const,
								image_url: { url },
							})),
						],
					},
				],
				response_format: { type: "json_object" },
				// Note: Some models don't support temperature parameter
				// Only include if model supports it
			})

			const responseContent =
				completion.choices[AI_CONSTANTS.RESPONSE_INDEX.FIRST_CHOICE]?.message
					?.content
			if (!responseContent) {
				throw new Error("No response from AI")
			}

			const parsed = JSON.parse(responseContent) as
				| GenerateGameResponse
				| { error: string; message: string }

			if ("error" in parsed && parsed.error === "inappropriate_content") {
				throw new Error(parsed.message)
			}

			return parsed as GenerateGameResponse
		} else {
			// Text only
			const completion = await openai.chat.completions.create({
				model: aiModel,
				messages: [
					{
						role: "system",
						content: SAFETY_SYSTEM_PROMPT,
					},
					{
						role: "user",
						content: prompt,
					},
				],
				response_format: { type: "json_object" },
				// Note: Some models don't support temperature parameter
				// Only include if model supports it
			})

			const responseContent =
				completion.choices[AI_CONSTANTS.RESPONSE_INDEX.FIRST_CHOICE]?.message
					?.content
			if (!responseContent) {
				throw new Error("No response from AI")
			}

			const parsed = JSON.parse(responseContent) as
				| GenerateGameResponse
				| { error: string; message: string }

			if ("error" in parsed && parsed.error === "inappropriate_content") {
				throw new Error(parsed.message)
			}

			return parsed as GenerateGameResponse
		}
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to generate game content: ${error.message}`)
		}
		throw new Error("Failed to generate game content: Unknown error")
	}
}
