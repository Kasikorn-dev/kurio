import { createOpenAICall } from "../../utils/openai.ts"
import { log } from "../../utils/other.ts"
import type { ProcessedResources } from "../../utils/resources.ts"
import type { Game } from "../types.ts"
import { insertGamesBatch, updateUnitStatusesBatch } from "./db.ts"

/**
 * Generate Kurio title and description based on processed resources
 */
export async function generateKurioInfo(params: {
	processedResources: ProcessedResources
}): Promise<{ title: string; description: string }> {
	const { processedResources } = params

	const { fullTextContent, fileUrls, imageUrls } = processedResources

	const prompt = `Based on this educational content, create a compelling course title and description:

Content:
${fullTextContent}
${fileUrls.length > 0 ? `\n\nIMPORTANT: Analyze the provided file(s) (PDF/document) and extract all relevant content.` : ""}
${imageUrls.length > 0 ? "\nAnalyze provided images for context.\n" : ""}

Requirements:
- Title: Short, engaging, and descriptive (max 60 characters)
- Description: 2-3 sentences explaining what students will learn (max 200 characters)
- Title should capture the essence of the entire course
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
		prompt,
		imageUrls,
		fileUrls,
	})

	if (!response.title || !response.description) {
		throw new Error("Failed to generate kurio info")
	}

	return {
		title: response.title.trim(),
		description: response.description.trim(),
	}
}

/**
 * Generate unit titles and descriptions (fast)
 */
export async function generateUnitTitles(params: {
	processedResources: ProcessedResources
	kurioTitle: string
	kurioDescription: string
	unitCount: number
}): Promise<{ titles: string[]; descriptions: string[] }> {
	const { processedResources, kurioTitle, kurioDescription, unitCount } = params

	const { fullTextContent, fileUrls, imageUrls } = processedResources

	const prompt = `Create ${unitCount} educational unit titles and descriptions for this course:

Course Title: "${kurioTitle}"
Course Description: "${kurioDescription}"

These units are part of the course above. Create unit titles and descriptions that align with the course theme and learning objectives.

Content:
${fullTextContent}
${fileUrls.length > 0 ? `\n\nIMPORTANT: Analyze the provided file(s) (PDF/document) and extract all relevant content. Create unit titles and descriptions based on the actual content structure.` : ""}
${imageUrls.length > 0 ? "\nAnalyze provided images for context.\n" : ""}

CRITICAL TITLE REQUIREMENTS:
- Exactly ${unitCount} unique, descriptive titles
- Titles MUST align with the course theme: "${kurioTitle}"
- Titles should help achieve the course goal: "${kurioDescription}"
- NO prefixes: NO "Unit 1:", "Unit 2:", "Unit X -", or any numbering
- NO suffixes: NO difficulty indicators like "(easy)", "(medium)", "(hard)" in parentheses
- NO game indicators: NO "Game 1:", "Game X:" in the title
- Clean titles: Just the topic/subject name only
- Progressive and sequential (each builds on previous)
- NO duplicates - each title must be unique
- Each title should represent a distinct learning topic
- Titles should flow logically from basic to advanced

CRITICAL DESCRIPTION REQUIREMENTS:
- Exactly ${unitCount} descriptions (one for each title)
- Each description should be 1-2 sentences explaining what students will learn in that unit
- Descriptions should align with the course description: "${kurioDescription}"
- Descriptions should be specific to the unit title
- Max 200 characters per description

CORRECT EXAMPLES:
✅ Title: "การทักทายและการแนะนำตัว"
✅ Description: "เรียนรู้วิธีการทักทายและแนะนำตัวในสถานการณ์ต่างๆ"

✅ Title: "คำศัพท์เกี่ยวกับครอบครัว"
✅ Description: "ศึกษาคำศัพท์เกี่ยวกับสมาชิกในครอบครัวและความสัมพันธ์"

WRONG EXAMPLES:
❌ Title: "Unit 1: การทักทาย"
❌ Title: "การทักทาย (easy)"
❌ Description: "Unit 1 description" (should not mention unit number)

Return JSON (EXACT FORMAT):
{
  "titles": ["Title 1", "Title 2", ..., "Title ${unitCount}"],
  "descriptions": ["Description 1", "Description 2", ..., "Description ${unitCount}"]
}

EXAMPLE RESPONSE FORMAT:
{
  "titles": [
    "การทักทายและการแนะนำตัว",
    "คำศัพท์เกี่ยวกับครอบครัว",
    "การใช้คำกริยาในประโยค",
    "การสร้างประโยคพื้นฐาน"
  ],
  "descriptions": [
    "เรียนรู้วิธีการทักทายและแนะนำตัวในสถานการณ์ต่างๆ",
    "ศึกษาคำศัพท์เกี่ยวกับสมาชิกในครอบครัวและความสัมพันธ์",
    "เข้าใจการใช้คำกริยาในประโยคและรูปแบบต่างๆ",
    "ฝึกสร้างประโยคพื้นฐานด้วยโครงสร้างที่ถูกต้อง"
  ]
}`

	const response = await createOpenAICall<{
		titles: string[]
		descriptions: string[]
	}>({
		prompt,
		imageUrls,
		fileUrls,
	})

	if (
		!response.titles ||
		!Array.isArray(response.titles) ||
		response.titles.length !== unitCount ||
		!response.descriptions ||
		!Array.isArray(response.descriptions) ||
		response.descriptions.length !== unitCount
	) {
		throw new Error(
			`Failed to generate ${unitCount} unit titles and descriptions. Got ${response.titles?.length ?? 0} titles and ${response.descriptions?.length ?? 0} descriptions.`,
		)
	}

	// Clean titles: Remove any unwanted prefixes/suffixes
	const cleanedTitles = response.titles.map((title) => {
		let cleaned = title.trim()
		// Remove "Unit X:", "Unit X -", "Game X:" prefixes
		cleaned = cleaned.replace(/^(Unit\s+\d+[:-\s]+|Game\s+\d+[:-\s]+)/i, "")
		// Remove difficulty suffixes in parentheses like "(easy)", "(medium)", "(hard)"
		cleaned = cleaned.replace(
			/\s*\(easy\)|\s*\(medium\)|\s*\(hard\)|\s*\(ง่าย\)|\s*\(ปานกลาง\)|\s*\(ยาก\)$/i,
			"",
		)
		// Remove trailing parentheses with partial text like "(medium"
		cleaned = cleaned.replace(/\s*\([^)]*$/, "")
		return cleaned.trim()
	})

	// Clean descriptions: Remove any unwanted prefixes/suffixes
	const cleanedDescriptions = response.descriptions.map((desc) => {
		let cleaned = desc.trim()
		// Remove "Unit X:" prefixes if any
		cleaned = cleaned.replace(/^(Unit\s+\d+[:-\s]+)/i, "")
		return cleaned.trim()
	})

	return {
		titles: cleanedTitles,
		descriptions: cleanedDescriptions,
	}
}

/**
 * Generate unit titles and descriptions (separate from kurio - for parallel processing)
 * This function works independently using only resources, without kurio context
 */
export async function generateUnitTitlesAndDescriptions(params: {
	processedResources: ProcessedResources
	unitCount: number
}): Promise<{ titles: string[]; descriptions: string[] }> {
	const { processedResources, unitCount } = params

	const { fullTextContent, fileUrls, imageUrls } = processedResources

	const prompt = `Create ${unitCount} educational unit titles and descriptions from this content:

Content:
${fullTextContent}
${fileUrls.length > 0 ? `\n\nIMPORTANT: Analyze the provided file(s) (PDF/document) and extract all relevant content. Create unit titles and descriptions based on the actual content structure.` : ""}
${imageUrls.length > 0 ? "\nAnalyze provided images for context.\n" : ""}

CRITICAL TITLE REQUIREMENTS:
- Exactly ${unitCount} unique, descriptive titles
- NO prefixes: NO "Unit 1:", "Unit 2:", "Unit X -", or any numbering
- NO suffixes: NO difficulty indicators like "(easy)", "(medium)", "(hard)" in parentheses
- NO game indicators: NO "Game 1:", "Game X:" in the title
- Clean titles: Just the topic/subject name only
- Progressive and sequential (each builds on previous)
- NO duplicates - each title must be unique
- Each title should represent a distinct learning topic
- Titles should flow logically from basic to advanced

CRITICAL DESCRIPTION REQUIREMENTS:
- Exactly ${unitCount} descriptions (one for each title)
- Each description should be 1-2 sentences explaining what students will learn in that unit
- Descriptions should be specific to the unit title
- Max 200 characters per description

CORRECT EXAMPLES:
✅ Title: "การทักทายและการแนะนำตัว"
✅ Description: "เรียนรู้วิธีการทักทายและแนะนำตัวในสถานการณ์ต่างๆ"

✅ Title: "คำศัพท์เกี่ยวกับครอบครัว"
✅ Description: "ศึกษาคำศัพท์เกี่ยวกับสมาชิกในครอบครัวและความสัมพันธ์"

WRONG EXAMPLES:
❌ Title: "Unit 1: การทักทาย"
❌ Title: "การทักทาย (easy)"
❌ Description: "Unit 1 description" (should not mention unit number)

Return JSON (EXACT FORMAT):
{
  "titles": ["Title 1", "Title 2", ..., "Title ${unitCount}"],
  "descriptions": ["Description 1", "Description 2", ..., "Description ${unitCount}"]
}

EXAMPLE RESPONSE FORMAT:
{
  "titles": [
    "การทักทายและการแนะนำตัว",
    "คำศัพท์เกี่ยวกับครอบครัว",
    "การใช้คำกริยาในประโยค",
    "การสร้างประโยคพื้นฐาน"
  ],
  "descriptions": [
    "เรียนรู้วิธีการทักทายและแนะนำตัวในสถานการณ์ต่างๆ",
    "ศึกษาคำศัพท์เกี่ยวกับสมาชิกในครอบครัวและความสัมพันธ์",
    "เข้าใจการใช้คำกริยาในประโยคและรูปแบบต่างๆ",
    "ฝึกสร้างประโยคพื้นฐานด้วยโครงสร้างที่ถูกต้อง"
  ]
}`

	const response = await createOpenAICall<{
		titles: string[]
		descriptions: string[]
	}>({
		prompt,
		imageUrls,
		fileUrls,
	})

	if (
		!response.titles ||
		!Array.isArray(response.titles) ||
		response.titles.length !== unitCount ||
		!response.descriptions ||
		!Array.isArray(response.descriptions) ||
		response.descriptions.length !== unitCount
	) {
		throw new Error(
			`Failed to generate ${unitCount} unit titles and descriptions. Got ${response.titles?.length ?? 0} titles and ${response.descriptions?.length ?? 0} descriptions.`,
		)
	}

	// Clean titles: Remove any unwanted prefixes/suffixes
	const cleanedTitles = response.titles.map((title) => {
		let cleaned = title.trim()
		// Remove "Unit X:", "Unit X -", "Game X:" prefixes
		cleaned = cleaned.replace(/^(Unit\s+\d+[:-\s]+|Game\s+\d+[:-\s]+)/i, "")
		// Remove difficulty suffixes in parentheses like "(easy)", "(medium)", "(hard)"
		cleaned = cleaned.replace(
			/\s*\(easy\)|\s*\(medium\)|\s*\(hard\)|\s*\(ง่าย\)|\s*\(ปานกลาง\)|\s*\(ยาก\)$/i,
			"",
		)
		// Remove trailing parentheses with partial text like "(medium"
		cleaned = cleaned.replace(/\s*\([^)]*$/, "")
		return cleaned.trim()
	})

	// Clean descriptions: Remove any unwanted prefixes/suffixes
	const cleanedDescriptions = response.descriptions.map((desc) => {
		let cleaned = desc.trim()
		// Remove "Unit X:" prefixes if any
		cleaned = cleaned.replace(/^(Unit\s+\d+[:-\s]+)/i, "")
		return cleaned.trim()
	})

	return {
		titles: cleanedTitles,
		descriptions: cleanedDescriptions,
	}
}

/**
 * Generate games for a specific unit
 */
export async function generateGamesForUnit(params: {
	processedResources: ProcessedResources
	kurioTitle: string
	kurioDescription: string
	unitTitle: string
	unitDescription: string
	unitIndex: number
	totalUnits: number
	allUnitTitles: string[]
	gamesPerUnit: number
}): Promise<{ games: Game[] }> {
	const {
		processedResources,
		kurioTitle,
		kurioDescription,
		unitTitle,
		unitDescription,
		unitIndex,
		totalUnits,
		allUnitTitles,
		gamesPerUnit,
	} = params

	const { fullTextContent, fileUrls, imageUrls } = processedResources

	const allTitlesContext = allUnitTitles
		.map((title, idx) => `${idx + 1}. ${title}`)
		.join("\n")

	const prompt = `Create ${gamesPerUnit} educational games for this unit:

Course Context:
- Course Title: "${kurioTitle}"
- Course Description: "${kurioDescription}"

Unit Context:
- Unit Title: "${unitTitle}"
- Unit Description: "${unitDescription}"
- Position: Unit ${unitIndex + 1} of ${totalUnits}

All Units in Course (for context continuity):
${allTitlesContext}

CRITICAL CONTENT REQUIREMENTS:
- ALL games MUST align with the course theme: "${kurioTitle}"
- Games should help achieve the course goal: "${kurioDescription}"
- ALL games MUST align with the unit description: "${unitDescription}"
- Games should help achieve the unit learning objective: "${unitDescription}"
- ALL games MUST be directly related to the unit title: "${unitTitle}"
- Game content (questions, text, items) MUST focus on the topic: "${unitTitle}"
- Extract content from the provided resources that specifically relates to "${unitTitle}"
- Each game should test or practice knowledge about "${unitTitle}"
- DO NOT create generic games - they must be specific to this unit's topic
- Games must build on previous units' content progressively
- Content must be sequential and continuous
- NO duplicate content from previous units
- Each game should advance the learning from previous units

${fullTextContent}
${fileUrls.length > 0 ? `\n\nIMPORTANT: Analyze the provided file(s) and extract content that is SPECIFICALLY related to the unit title "${unitTitle}" and unit description "${unitDescription}". Focus on sections that discuss or teach about "${unitTitle}".` : ""}

CRITICAL TITLE REQUIREMENTS FOR GAMES:
- ABSOLUTELY NO prefixes: NO "Unit", "Unit X", "Unit X:", "Unit X -", "Game X", "Game X:", "Game X -" in titles
- NO suffixes: NO difficulty indicators like "(easy)", "(medium)", "(hard)" in parentheses
- NO unit numbers or references: NO "Unit 3", "Unit 4", or any mention of unit number
- Clean titles: Just describe what the game teaches or tests about "${unitTitle}"
- Titles should be concise and descriptive (max 60 characters)
- Title should reflect the specific topic of "${unitTitle}", not generic game types

CORRECT TITLE EXAMPLES (for unit "${unitTitle}"):
✅ "เติมคำในช่องว่าง" (if unit is about vocabulary)
✅ "เลือกคำตอบที่ถูกต้อง" (if unit is about grammar)
✅ "จับคู่คำศัพท์กับความหมาย" (if unit is about vocabulary)
✅ "ประธานในประโยค" (if unit is about sentence structure)

WRONG TITLE EXAMPLES:
❌ "Unit 3 - เติมคำในช่องว่าง" (has "Unit" prefix)
❌ "Unit 4 Game 9: ประธานในประโยค" (has "Unit" and "Game" prefix)
❌ "เติมคำในช่องว่าง (easy)" (has difficulty suffix)
❌ "Game 1: เลือกคำตอบ" (has "Game" prefix)
❌ "Unit 1: การทักทาย" (has "Unit" prefix)
❌ "Unit การทักทาย" (has "Unit" word)

IMPORTANT: The title should describe what the game teaches about "${unitTitle}", NOT include the word "Unit" anywhere.

Create exactly ${gamesPerUnit} games about "${unitTitle}" (${unitDescription}):
- Mix: quiz, matching, fill_blank, multiple_choice (distribute evenly)
- Difficulty: easy, medium, hard (distribute evenly)
- ALL content must be about "${unitTitle}" topic
- Progressive content building on previous units
- Each game should test different aspects of "${unitTitle}"

GAME SCHEMAS (EXACT FORMAT):

1. MULTIPLE_CHOICE:
{
  "title": "คำอธิบายของเกมเกี่ยวกับหัวข้อ unit (ไม่มีคำว่า Unit/Game นำหน้า, ไม่มี difficulty suffix)",
  "gameType": "multiple_choice",
  "difficultyLevel": "easy",
  "content": {
    "question": "คำถามที่เกี่ยวกับหัวข้อ unit โดยตรง",
    "options": ["ตัวเลือก A", "ตัวเลือก B", "ตัวเลือก C", "ตัวเลือก D"],
    "correctAnswer": 0
  }
}

2. QUIZ:
{
  "title": "คำอธิบายของเกมเกี่ยวกับหัวข้อ unit (ไม่มีคำว่า Unit/Game นำหน้า, ไม่มี difficulty suffix)",
  "gameType": "quiz",
  "difficultyLevel": "medium",
  "content": {
    "question": "คำถามที่เกี่ยวกับหัวข้อ unit โดยตรง",
    "correctAnswer": "คำตอบที่ถูกต้องเกี่ยวกับหัวข้อ unit"
  }
}

3. FILL_BLANK:
{
  "title": "คำอธิบายของเกมเกี่ยวกับหัวข้อ unit (ไม่มีคำว่า Unit/Game นำหน้า, ไม่มี difficulty suffix)",
  "gameType": "fill_blank",
  "difficultyLevel": "hard",
  "content": {
    "text": "ประโยคเกี่ยวกับหัวข้อ unit ที่มี ___ ช่องว่าง ___ หลายจุด",
    "blanks": [
      {"answer": "คำตอบสำหรับช่องว่างแรกที่เกี่ยวกับหัวข้อ unit"},
      {"answer": "คำตอบสำหรับช่องว่างที่สองที่เกี่ยวกับหัวข้อ unit"}
    ]
  }
}

4. MATCHING:
{
  "title": "คำอธิบายของเกมเกี่ยวกับหัวข้อ unit (ไม่มีคำว่า Unit/Game นำหน้า, ไม่มี difficulty suffix)",
  "gameType": "matching",
  "difficultyLevel": "easy",
  "content": {
    "leftItems": ["รายการซ้าย 1 ที่เกี่ยวกับหัวข้อ unit", "รายการซ้าย 2 ที่เกี่ยวกับหัวข้อ unit"],
    "rightItems": ["รายการขวา 1 ที่เกี่ยวกับหัวข้อ unit", "รายการขวา 2 ที่เกี่ยวกับหัวข้อ unit"],
    "correctPairs": [
      {"left": "รายการซ้าย 1 ที่เกี่ยวกับหัวข้อ unit", "right": "รายการขวา 1 ที่เกี่ยวกับหัวข้อ unit"},
      {"left": "รายการซ้าย 2 ที่เกี่ยวกับหัวข้อ unit", "right": "รายการขวา 2 ที่เกี่ยวกับหัวข้อ unit"}
    ]
  }
}

Return JSON (EXACT FORMAT - NO COMMENTS):
{
  "games": [
    {
      "title": "string (clean, no prefixes/suffixes)",
      "gameType": "quiz|matching|fill_blank|multiple_choice",
      "difficultyLevel": "easy|medium|hard",
      "content": { /* see schemas above */ }
    }
    /* ... exactly ${gamesPerUnit} games total */
  ]
}

EXAMPLE RESPONSE FORMAT (for unit "${unitTitle}"):
{
  "games": [
    {
      "title": "เติมคำในช่องว่าง",
      "gameType": "fill_blank",
      "difficultyLevel": "easy",
      "content": {
        "text": "เนื้อหาที่เกี่ยวกับ ${unitTitle} มี ___ ช่องว่าง",
        "blanks": [{"answer": "คำตอบที่เกี่ยวกับ ${unitTitle}"}]
      }
    },
    {
      "title": "เลือกคำตอบที่ถูกต้อง",
      "gameType": "multiple_choice",
      "difficultyLevel": "medium",
      "content": {
        "question": "คำถามที่เกี่ยวกับ ${unitTitle}?",
        "options": ["ตัวเลือกที่เกี่ยวกับ ${unitTitle} 1", "ตัวเลือกที่เกี่ยวกับ ${unitTitle} 2", "ตัวเลือกที่เกี่ยวกับ ${unitTitle} 3", "ตัวเลือกที่เกี่ยวกับ ${unitTitle} 4"],
        "correctAnswer": 0
      }
    },
    {
      "title": "จับคู่คำศัพท์",
      "gameType": "matching",
      "difficultyLevel": "hard",
      "content": {
        "leftItems": ["คำศัพท์ที่เกี่ยวกับ ${unitTitle} 1", "คำศัพท์ที่เกี่ยวกับ ${unitTitle} 2"],
        "rightItems": ["ความหมายที่เกี่ยวกับ ${unitTitle} 1", "ความหมายที่เกี่ยวกับ ${unitTitle} 2"],
        "correctPairs": [
          {"left": "คำศัพท์ที่เกี่ยวกับ ${unitTitle} 1", "right": "ความหมายที่เกี่ยวกับ ${unitTitle} 1"},
          {"left": "คำศัพท์ที่เกี่ยวกับ ${unitTitle} 2", "right": "ความหมายที่เกี่ยวกับ ${unitTitle} 2"}
        ]
      }
    },
    {
      "title": "ตอบคำถาม",
      "gameType": "quiz",
      "difficultyLevel": "easy",
      "content": {
        "question": "คำถามเกี่ยวกับ ${unitTitle}?",
        "correctAnswer": "คำตอบที่เกี่ยวกับ ${unitTitle}"
      }
    }
  ]
}

REMEMBER:
- Title must NOT contain "Unit" anywhere
- All content must be about "${unitTitle}"
- Title should describe what the game teaches about "${unitTitle}"`

	const response = await createOpenAICall<{ games: Game[] }>({
		prompt,
		imageUrls,
		fileUrls,
	})

	if (!response.games || !Array.isArray(response.games)) {
		throw new Error("Failed to generate games array")
	}

	if (response.games.length !== gamesPerUnit) {
		throw new Error(
			`Expected ${gamesPerUnit} games, got ${response.games.length}`,
		)
	}

	// Clean game titles: Remove any unwanted prefixes/suffixes
	const cleanedGames = response.games.map((game) => {
		let cleanedTitle = game.title.trim()
		// Remove "Unit X:", "Unit X -", "Game X:" prefixes
		cleanedTitle = cleanedTitle.replace(
			/^(Unit\s+\d+[:-\s]+|Game\s+\d+[:-\s]+)/i,
			"",
		)
		// Remove "Unit" word at the beginning (with or without number)
		cleanedTitle = cleanedTitle.replace(/^Unit\s+/i, "")
		// Remove "Unit X" anywhere in the title (more aggressive)
		cleanedTitle = cleanedTitle.replace(/\bUnit\s+\d+\b/gi, "")
		// Remove standalone "Unit" word anywhere
		cleanedTitle = cleanedTitle.replace(/\bUnit\b/gi, "")
		// Remove "Game X:" prefixes
		cleanedTitle = cleanedTitle.replace(/^Game\s+\d+[:-\s]+/i, "")
		// Remove difficulty suffixes in parentheses like "(easy)", "(medium)", "(hard)"
		cleanedTitle = cleanedTitle.replace(
			/\s*\(easy\)|\s*\(medium\)|\s*\(hard\)|\s*\(ง่าย\)|\s*\(ปานกลาง\)|\s*\(ยาก\)$/i,
			"",
		)
		// Remove trailing parentheses with partial text like "(medium"
		cleanedTitle = cleanedTitle.replace(/\s*\([^)]*$/, "")
		// Clean up multiple spaces
		cleanedTitle = cleanedTitle.replace(/\s+/g, " ")

		return {
			...game,
			title: cleanedTitle.trim(),
		}
	})

	return {
		games: cleanedGames,
	}
}

/**
 * Generate games for all units in parallel
 * Uses Promise.allSettled to handle errors gracefully
 */
export async function generateGamesForAllUnits(params: {
	insertedUnits: Array<{
		id: string
		title: string
		description: string
		order_index: number
	}>
	processedResources: ProcessedResources
	kurioTitle: string
	kurioDescription: string
	unitTitles: string[]
	gamesPerUnit: number
}): Promise<{
	successfulUnits: Array<{ unitId: string; games: Game[] }>
	failedUnitIds: string[]
	totalGames: number
}> {
	const {
		insertedUnits,
		processedResources,
		kurioTitle,
		kurioDescription,
		unitTitles,
		gamesPerUnit,
	} = params

	// Generate games for all units in parallel
	const unitResults = await Promise.allSettled(
		insertedUnits.map(async (unit) => {
			const games = await generateGamesForUnit({
				processedResources,
				kurioTitle,
				kurioDescription,
				unitTitle: unit.title,
				unitDescription: unit.description,
				unitIndex: unit.order_index,
				totalUnits: insertedUnits.length,
				allUnitTitles: unitTitles,
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
	let totalGames = 0

	unitResults.forEach((result, index) => {
		if (result.status === "fulfilled") {
			successfulUnits.push({
				unitId: result.value.unitId,
				games: result.value.games,
			})
			totalGames += result.value.games.length
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
		totalGames,
	}
}

/**
 * Insert games and update unit statuses using batch operations
 * Much faster than individual inserts/updates
 * @param sql - Database connection (required for all database operations)
 */
export async function insertGamesAndUpdateStatuses(params: {
	successfulUnits: Array<{ unitId: string; games: Game[] }>
	failedUnitIds: string[]
}): Promise<{ totalGamesInserted: number }> {
	const { successfulUnits, failedUnitIds } = params

	// Flatten all games from all units into a single array
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

	// Batch insert all games at once
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
