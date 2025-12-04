import { getEnvironmentVariables } from "./env.ts"

/**
 * Call OpenAI API with type-safe response
 */
export async function createOpenAICall<T extends object>(params: {
	prompt: string
	imageUrls: string[]
	fileUrls: string[]
}): Promise<T> {
	const { prompt, imageUrls, fileUrls } = params
	const { aiModel, openaiApiKey } = getEnvironmentVariables()

	const messages: Array<{
		role: string
		content:
			| string
			| Array<{ type: string; text?: string; image_url?: { url: string } }>
	}> = [
		{
			role: "system",
			content:
				"You are an educational content generator. Create appropriate, age-appropriate educational content. Always return valid JSON in the exact format requested. Do not include any prefixes (like 'Unit X:', 'Game X:') or suffixes (like difficulty in parentheses) in titles unless explicitly requested.",
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
			model: aiModel,
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
