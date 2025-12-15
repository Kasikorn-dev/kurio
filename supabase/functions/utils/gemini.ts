import { getEnvironmentVariables } from "./env.ts"
import { log } from "./other.ts"

/**
 * Gemini AI utility for generating content
 * Uses Gemini REST API: https://ai.google.dev/gemini-api/docs/text-generation
 */

/**
 * Download file from Supabase Storage and convert to base64
 */
async function downloadAndEncodeFile(
	filePath: string,
): Promise<{ base64: string; mimeType: string } | null> {
	try {
		const { supabaseUrl, supabaseServiceKey } = getEnvironmentVariables()
		const downloadUrl = `${supabaseUrl}/storage/v1/object/kurio-resources/${filePath}`

		const response = await fetch(downloadUrl, {
			headers: {
				Authorization: `Bearer ${supabaseServiceKey}`,
			},
		})

		if (!response.ok) {
			log("Failed to download file", { filePath, status: response.status })
			return null
		}

		const buffer = await response.arrayBuffer()
		const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
		const mimeType =
			response.headers.get("content-type") || "application/octet-stream"

		return { base64, mimeType }
	} catch (error) {
		log("Failed to fetch file", { filePath, error })
		return null
	}
}

/**
 * Call Gemini API with type-safe response
 * Supports text, images, and files (PDFs)
 * Uses Gemini REST API: https://ai.google.dev/gemini-api/docs/text-generation
 */
export async function createGeminiCall<T extends object>(params: {
	prompt: string
	imageFilePaths?: string[]
	fileFilePaths?: string[]
}): Promise<T> {
	const { prompt, imageFilePaths = [], fileFilePaths = [] } = params

	// Build parts array for the content
	const parts: Array<{
		text?: string
		inline_data?: { mime_type: string; data: string }
	}> = []

	// Add text prompt
	parts.push({ text: prompt })

	// Add images (download from Supabase Storage and convert to base64)
	for (const filePath of imageFilePaths) {
		const result = await downloadAndEncodeFile(filePath)
		if (result) {
			parts.push({
				inline_data: {
					mime_type: result.mimeType,
					data: result.base64,
				},
			})
		}
	}

	// Add files (PDFs) - download from Supabase Storage and convert to base64
	for (const filePath of fileFilePaths) {
		const result = await downloadAndEncodeFile(filePath)
		if (result) {
			parts.push({
				inline_data: {
					mime_type: "application/pdf",
					data: result.base64,
				},
			})
		}
	}

	// Call Gemini API
	const { geminiApiKey, aiModel } = getEnvironmentVariables()

	const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${geminiApiKey}`

	const response = await fetch(apiUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			contents: [
				{
					parts,
				},
			],
			generationConfig: {
				response_mime_type: "application/json",
			},
		}),
	})

	if (!response.ok) {
		const error = await response.text()
		log("Gemini API error", { error, status: response.status })
		throw new Error(`Gemini API error: ${error}`)
	}

	const data = await response.json()
	const content = data.candidates?.[0]?.content?.parts?.[0]?.text

	if (!content) {
		log("No response from Gemini", { data })
		throw new Error("No response from Gemini AI")
	}

	const parsedContent = JSON.parse(content)
	const contentWithModel = {
		...parsedContent,
		aiModel,
	}
	return contentWithModel
}
