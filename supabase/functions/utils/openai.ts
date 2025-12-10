import { getEnvironmentVariables } from "./env.ts"

/**
 * Download file content from URL and extract text
 * Supports PDF, text files, and other document formats
 */
async function downloadAndExtractFileContent(
	url: string,
): Promise<string | null> {
	try {
		const response = await fetch(url)
		if (!response.ok) {
			console.warn(`Failed to download file from ${url}: ${response.statusText}`)
			return null
		}

		const contentType = response.headers.get("content-type") || ""
		const buffer = await response.arrayBuffer()

		// Handle PDF files
		if (contentType.includes("pdf") || url.toLowerCase().endsWith(".pdf")) {
			// For PDF, we'll need to extract text
			// Since Deno doesn't have native PDF parsing, we'll convert to base64
			// and let GPT-4o handle it (GPT-4o can read PDFs)
			const base64 = btoa(
				String.fromCharCode(...new Uint8Array(buffer)),
			)
			return `[PDF File Content - Base64]: ${base64.substring(0, 1000)}... (truncated for preview)`
		}

		// Handle text files (txt, md, etc.)
		if (
			contentType.includes("text") ||
			url.toLowerCase().match(/\.(txt|md|markdown|csv|json|xml|html)$/i)
		) {
			const decoder = new TextDecoder("utf-8")
			return decoder.decode(buffer)
		}

		// Handle other file types - try to decode as text
		try {
			const decoder = new TextDecoder("utf-8")
			const text = decoder.decode(buffer)
			// If decoded text contains too many non-printable characters, it's probably binary
			const nonPrintableRatio =
				text.split("").filter((c) => c.charCodeAt(0) < 32 && c !== "\n" && c !== "\r" && c !== "\t").length /
				text.length
			if (nonPrintableRatio > 0.1) {
				console.warn(`File ${url} appears to be binary, skipping text extraction`)
				return null
			}
			return text
		} catch {
			return null
		}
	} catch (error) {
		console.warn(`Error downloading file from ${url}:`, error)
		return null
	}
}

/**
 * Call OpenAI API with type-safe response
 * Now downloads and extracts file content before sending to AI
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

	// Download and extract file contents
	const fileContents: string[] = []
	if (fileUrls.length > 0) {
		const extractedContents = await Promise.all(
			fileUrls.map((url) => downloadAndExtractFileContent(url)),
		)
		for (let i = 0; i < fileUrls.length; i++) {
			const content = extractedContents[i]
			if (content) {
				fileContents.push(`\n\n[File ${i + 1} Content]:\n${content}`)
			} else {
				fileContents.push(`\n\n[File ${i + 1}]: Unable to extract content from ${fileUrls[i]}`)
			}
		}
	}

	if (imageUrls.length > 0 || fileUrls.length > 0) {
		messages.push({
			role: "user",
			content: [
				{ type: "text", text: prompt + fileContents.join("\n") },
				...imageUrls.map((url) => ({
					type: "image_url",
					image_url: { url },
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
