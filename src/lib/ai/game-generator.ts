import { AI_CONSTANTS } from "@/lib/constants"
import { openai } from "./openai-client"

type Resource = {
	resourceType: "text" | "file" | "image"
	resourceContent?: string
	resourceFileUrl?: string
}

type GenerateGameParams = {
	resources: Resource[]
	aiModel?: string
}

type GenerateGameResponse = {
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
	const { resources, aiModel = AI_CONSTANTS.DEFAULT_MODEL } = params

	// Prepare content from resources
	const contentText = resources
		.map((r) => {
			if (r.resourceType === "text" && r.resourceContent) {
				return r.resourceContent
			}
			return null
		})
		.filter(Boolean)
		.join("\n\n")

	const prompt = `Create an educational game based on the following content.

Content:
${contentText}

Please generate:
1. A list of units directly
2. Games for each unit (quiz, matching, fill_blank, or multiple_choice)
3. Each game should have appropriate difficulty (easy, medium, or hard)

Return the response as JSON with this structure:
{
  "units": [
    {
      "title": "Unit title",
      "games": [
        {
          "title": "Game title",
          "gameType": "quiz" | "matching" | "fill_blank" | "multiple_choice",
          "difficultyLevel": "easy" | "medium" | "hard",
          "content": {
            "question": "...",
            "options": [...],
            "correctAnswer": "...",
            ...
          }
        }
      ]
    }
  ]
}`

	try {
		const completion = await openai.chat.completions.create({
			model: aiModel,
			messages: [
				{
					role: "system",
					content:
						"You are an educational game creator. Generate engaging and educational games based on provided content.",
				},
				{
					role: "user",
					content: prompt,
				},
			],
			response_format: { type: "json_object" },
		})

		const responseContent =
			completion.choices[AI_CONSTANTS.RESPONSE_INDEX.FIRST_CHOICE]?.message
				?.content
		if (!responseContent) {
			throw new Error("No response from AI")
		}

		return JSON.parse(responseContent) as GenerateGameResponse
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Failed to generate game content: ${error.message}`)
		}
		throw new Error("Failed to generate game content: Unknown error")
	}
}
