import type { Resource } from "../generate-kurio-units/types.ts"

export type ProcessedResources = {
	textContent: string
	fileUrls: string[]
	imageUrls: string[]
	fullTextContent: string
}

export function extractTextContent(resources: Resource[]): string {
	return resources
		.filter((r) => r.type === "text" && r.content)
		.map((r) => r.content)
		.join("\n\n")
}

export function extractFileUrls(resources: Resource[]): string[] {
	return resources
		.filter((r) => r.type === "file" && r.fileUrl)
		.map((r) => r.fileUrl as string)
}

export function extractImageUrls(resources: Resource[]): string[] {
	return resources
		.filter((r) => r.type === "image" && r.fileUrl)
		.map((r) => r.fileUrl as string)
}

export function buildTextContent(
	textContent: string,
	fileUrls: string[],
): string {
	let content = textContent
	if (fileUrls.length > 0) {
		content += `\n\nFile URLs to analyze: ${fileUrls.join(", ")}`
	}
	return content
}

/**
 * Process resources once - extract all content, URLs, and build full text
 * This should be called once before PHASE 1 and the result passed to all generation functions
 */
export function processResources(resources: Resource[]): ProcessedResources {
	const textContent = extractTextContent(resources)
	const fileUrls = extractFileUrls(resources)
	const imageUrls = extractImageUrls(resources)
	const fullTextContent = buildTextContent(textContent, fileUrls)

	return {
		textContent,
		fileUrls,
		imageUrls,
		fullTextContent,
	}
}
