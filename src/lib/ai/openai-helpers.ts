/**
 * Shared utilities for OpenAI API calls
 */

import { AI_CONSTANTS } from "@/lib/constants"
import { SAFETY_SYSTEM_PROMPT } from "./content-safety"
import { openai } from "./openai-client"

type OpenAIResponse<T> = T | { error: string; message: string }

/**
 * Create OpenAI API call with vision support for images and files
 */
export async function createOpenAICall<T extends object>(params: {
	model: string
	prompt: string
	imageUrls: string[]
	fileUrls: string[]
}): Promise<T> {
	const { model, prompt, imageUrls, fileUrls } = params

	if (imageUrls.length > 0 || fileUrls.length > 0) {
		const completion = await openai.chat.completions.create({
			model,
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
						...fileUrls.map((url) => ({
							type: "text" as const,
							text: `\n\nFile URL to analyze: ${url}\nPlease extract and use the actual content from this file.`,
						})),
					],
				},
			],
			response_format: { type: "json_object" },
		})

		return parseOpenAIResponse<T>(completion)
	} else {
		const completion = await openai.chat.completions.create({
			model,
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
		})

		return parseOpenAIResponse<T>(completion)
	}
}

/**
 * Parse OpenAI response and handle errors
 */
function parseOpenAIResponse<T extends object>(
	completion: Awaited<ReturnType<typeof openai.chat.completions.create>>,
): T {
	// Handle both ChatCompletion and Stream types
	if ("choices" in completion && Array.isArray(completion.choices)) {
		const responseContent =
			completion.choices[AI_CONSTANTS.RESPONSE_INDEX.FIRST_CHOICE]?.message
				?.content

		if (!responseContent) {
			throw new Error("No response from AI")
		}

		const parsed = JSON.parse(responseContent) as OpenAIResponse<T>

		if ("error" in parsed && parsed.error === "inappropriate_content") {
			throw new Error(parsed.message)
		}

		return parsed as T
	}

	throw new Error("Invalid response format from AI")
}
