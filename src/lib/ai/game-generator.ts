import { openai } from "./openai-client"

type Resource = {
	resourceType: "text" | "file" | "image"
	resourceContent?: string
	resourceFileUrl?: string
}

type GenerateGameParams = {
	resources: Resource[]
	difficultyLevel: "easy" | "medium" | "hard" | "mixed"
	aiModel?: string
}

export async function generateGameContent(params: GenerateGameParams) {
	const { resources, difficultyLevel, aiModel = "gpt-4o-mini" } = params

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

	const prompt = `Create an educational game based on the following content. Difficulty level: ${difficultyLevel}

Content:
${contentText}

Please generate:
1. A unit structure with lessons
2. Exercises for each lesson (quiz, matching, fill_blank, or multiple_choice)
3. Each exercise should have appropriate difficulty based on the level

Return the response as JSON with this structure:
{
  "units": [
    {
      "title": "Unit title",
      "lessons": [
        {
          "title": "Lesson title",
          "exercises": [
            {
              "title": "Exercise title",
              "exerciseType": "quiz" | "matching" | "fill_blank" | "multiple_choice",
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

		const responseContent = completion.choices[0]?.message?.content
		if (!responseContent) {
			throw new Error("No response from AI")
		}

		return JSON.parse(responseContent) as {
			units: Array<{
				title: string
				lessons: Array<{
					title: string
					exercises: Array<{
						title: string
						exerciseType: "quiz" | "matching" | "fill_blank" | "multiple_choice"
						difficultyLevel: "easy" | "medium" | "hard"
						content: Record<string, unknown>
					}>
				}>
			}>
		}
	} catch (error) {
		console.error("Error generating game content:", error)
		throw error
	}
}
