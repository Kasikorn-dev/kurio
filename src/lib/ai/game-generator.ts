import { AI_CONSTANTS } from "@/lib/constants"
import { validateContentSafety } from "./content-safety"
import { createOpenAICall } from "./openai-helpers"
import type { Resource } from "./resource-utils"
import {
	buildTextContent,
	extractFileUrls,
	extractImageUrls,
	extractTextContent,
} from "./resource-utils"

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

type GenerateSingleUnitResponse = {
	title: string
	games: Array<{
		title: string
		gameType: "quiz" | "matching" | "fill_blank" | "multiple_choice"
		difficultyLevel: "easy" | "medium" | "hard"
		content: Record<string, unknown>
	}>
}

type PreviousUnitContext = {
	title: string
	sampleGames: Array<{
		title: string
		gameType: string
		content: Record<string, unknown>
	}>
}

export async function generateSingleUnit(params: {
	resources: Resource[]
	aiModel?: string
	gamesPerUnit: number
	courseTitle?: string
	unitIndex?: number
	totalUnits?: number
	previousUnits?: PreviousUnitContext[]
}): Promise<GenerateSingleUnitResponse> {
	const {
		resources,
		aiModel = AI_CONSTANTS.DEFAULT_MODEL,
		gamesPerUnit,
		courseTitle,
		unitIndex,
		totalUnits,
		previousUnits,
	} = params

	// Prepare resources
	const textContentFromResources = extractTextContent(resources)
	const fileUrls = extractFileUrls(resources)
	const imageUrls = extractImageUrls(resources)
	const textContent = buildTextContent(textContentFromResources, fileUrls)

	// Validate content safety
	const safetyCheck = validateContentSafety(textContent)
	if (!safetyCheck.safe) {
		throw new Error(
			`Content safety check failed: ${safetyCheck.reason}. Please provide appropriate educational content.`,
		)
	}

	const unitContext =
		unitIndex !== undefined && totalUnits !== undefined
			? `\nThis is unit ${unitIndex + 1} of ${totalUnits} total units.`
			: ""

	const courseContext = courseTitle ? `\nCourse: ${courseTitle}` : ""

	// Build previous units context (optimized for speed)
	let previousUnitsContext = ""
	if (previousUnits && previousUnits.length > 0) {
		const previousTitles = previousUnits.map((u) => u.title).join(", ")
		previousUnitsContext = `\n\nPrevious units: ${previousTitles}\nIMPORTANT: Create unique title and progressive content. Title must differ from previous units.`
	}

	const prompt = `You MUST create 1 educational unit with exactly ${gamesPerUnit} games.${courseContext}${unitContext}${previousUnitsContext}

${textContent}
${fileUrls.length > 0 ? `\n\nIMPORTANT: Analyze the provided file(s) (PDF/document) and extract all relevant content. Use the actual content from the file(s) to create educational games. Do not generate generic content.` : ""}
${imageUrls.length > 0 ? "\nAnalyze images for context.\n" : ""}

MANDATORY OUTPUT REQUIREMENTS:
1. **Unit Title (MANDATORY - MUST BE PRESENT)**: 
   - You MUST provide a non-empty, descriptive title
   - NO "Unit 1:", "Unit 2:", or numbering prefix
   - Must be unique from previous units
   - Example CORRECT: "Passage Basics"
   - Example WRONG: "Unit 1: Passage Basics" or "" or null

2. **Games Array (MANDATORY)**: Exactly ${gamesPerUnit} games
   - Mix: quiz, matching, fill_blank, multiple_choice (distribute evenly)
   - Difficulty: easy, medium, hard (distribute evenly)
   - Progressive content building on previous units
   - Beginner-friendly

Game Schemas:
MULTIPLE_CHOICE: {"title": "...", "gameType": "multiple_choice", "difficultyLevel": "easy|medium|hard", "content": {"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0}}
QUIZ: {"title": "...", "gameType": "quiz", "difficultyLevel": "easy|medium|hard", "content": {"question": "...", "correctAnswer": "..."}}
FILL_BLANK: {"title": "...", "gameType": "fill_blank", "difficultyLevel": "easy|medium|hard", "content": {"text": "... ___ ...", "blanks": [{"answer": "..."}]}}
MATCHING: {"title": "...", "gameType": "matching", "difficultyLevel": "easy|medium|hard", "content": {"leftItems": ["..."], "rightItems": ["..."], "correctPairs": [{"left": "...", "right": "..."}]}}

MANDATORY JSON RESPONSE FORMAT (MUST INCLUDE BOTH FIELDS):
{
  "title": "Your Unit Title Here - MUST be a non-empty string",
  "games": [/* exactly ${gamesPerUnit} games following the schemas above */]
}

CRITICAL: The "title" field is REQUIRED and MUST NOT be empty, null, or undefined.`

	try {
		const unitResponse = await createOpenAICall<GenerateSingleUnitResponse>({
			model: aiModel,
			prompt,
			imageUrls,
			fileUrls,
		})

		// Validate response structure
		if (
			!unitResponse.title ||
			typeof unitResponse.title !== "string" ||
			unitResponse.title.trim() === ""
		) {
			throw new Error(
				`AI failed to generate unit title. Response: ${JSON.stringify(unitResponse)}`,
			)
		}

		if (!unitResponse.games || !Array.isArray(unitResponse.games)) {
			throw new Error(
				`AI failed to generate games. Response: ${JSON.stringify(unitResponse)}`,
			)
		}

		// Ensure title is trimmed and not empty
		unitResponse.title = unitResponse.title.trim()

		return unitResponse
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to generate unit: ${error.message}`)
		}
		throw new Error("Failed to generate unit: Unknown error")
	}
}

type GenerateCourseMetadataResponse = {
	title: string
	description?: string
}

export async function generateCourseMetadata(params: {
	resources: Resource[]
	aiModel?: string
	unitTitles?: string[]
}): Promise<GenerateCourseMetadataResponse> {
	const { resources, aiModel = AI_CONSTANTS.DEFAULT_MODEL, unitTitles } = params

	// Prepare resources
	const textContentFromResources = extractTextContent(resources)
	const fileUrls = extractFileUrls(resources)
	const imageUrls = extractImageUrls(resources)
	const textContent = buildTextContent(textContentFromResources, fileUrls)

	const unitContext =
		unitTitles && unitTitles.length > 0
			? `\n\nGenerated units: ${unitTitles.join(", ")}`
			: ""

	const prompt = `Based on this educational content, create a course title and description:${unitContext}

${textContent}
${fileUrls.length > 0 ? `\n\nIMPORTANT: Analyze the provided file(s) (PDF/document) and extract all relevant content. Use the actual content from the file(s) to create the course title and description.` : ""}
${imageUrls.length > 0 ? "\nAnalyze provided images for additional context.\n" : ""}

Requirements:
- Title (max 255 chars): Descriptive name WITHOUT "Unit", "Educational Course", "Course", or unit count
- Description (max 500 chars, optional): Brief overview of the course content

Naming Rules:
- Title: "Medical History and Penicillin" NOT "A 30-Unit Educational Course"
- Title: "Reading Comprehension Basics" NOT "30-Unit Reading Course"

Return JSON:
{
  "title": "Course Title",
  "description": "Optional description"
}`

	try {
		return await createOpenAICall<GenerateCourseMetadataResponse>({
			model: aiModel,
			prompt,
			imageUrls,
			fileUrls,
		})
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to generate course metadata: ${error.message}`)
		}
		throw new Error("Failed to generate course metadata: Unknown error")
	}
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

	// Prepare resources
	const textContentFromResources = extractTextContent(resources)
	const fileUrls = extractFileUrls(resources)
	const imageUrls = extractImageUrls(resources)
	const textContent = buildTextContent(textContentFromResources, fileUrls)

	// Validate content safety
	const safetyCheck = validateContentSafety(textContent)
	if (!safetyCheck.safe) {
		throw new Error(
			`Content safety check failed: ${safetyCheck.reason}. Please provide appropriate educational content.`,
		)
	}

	const prompt = `Create ${unitCount} educational units with ${gamesPerUnit} games each from this content:

${textContent}
${fileUrls.length > 0 ? `\n\nIMPORTANT: Analyze the provided file(s) (PDF/document) and extract all relevant content. Use the actual content from the file(s) to create educational games. Do not generate generic content.` : ""}
${imageUrls.length > 0 ? "\nAnalyze provided images for additional context.\n" : ""}

Requirements:
- Title (max 255 chars): Descriptive name WITHOUT "Unit", "Educational Course", or unit count
- Description (max 500 chars, optional)
- ${unitCount} units, each with ${gamesPerUnit} games
- Game types: quiz, matching, fill_blank, multiple_choice (mix evenly)
- Difficulty: easy, medium, hard (distribute evenly)
- Educational and age-appropriate

Naming Rules (NO prefixes):
- Title: "Medical History" NOT "A 30-Unit Course"
- Units: "Passage Basics" NOT "Unit 1: Passage Basics"
- Games: "terms and ideas" NOT "Matching: terms and ideas"

Game Schemas:

MULTIPLE_CHOICE: {"title": "...", "gameType": "multiple_choice", "difficultyLevel": "easy|medium|hard", "content": {"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0}}

QUIZ: {"title": "...", "gameType": "quiz", "difficultyLevel": "easy|medium|hard", "content": {"question": "...", "correctAnswer": "..."}}

FILL_BLANK: {"title": "...", "gameType": "fill_blank", "difficultyLevel": "easy|medium|hard", "content": {"text": "... ___ ...", "blanks": [{"answer": "..."}]}}

MATCHING: {"title": "...", "gameType": "matching", "difficultyLevel": "easy|medium|hard", "content": {"leftItems": ["..."], "rightItems": ["..."], "correctPairs": [{"left": "...", "right": "..."}]}}

Return JSON:
{
  "title": "Course Title",
  "description": "Optional description",
  "units": [{"title": "Unit Title", "games": [/* games */]}]
}`

	try {
		return await createOpenAICall<GenerateGameResponse>({
			model: aiModel,
			prompt,
			imageUrls,
			fileUrls,
		})
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to generate game content: ${error.message}`)
		}
		throw new Error("Failed to generate game content: Unknown error")
	}
}
