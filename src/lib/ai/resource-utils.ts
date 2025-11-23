/**
 * Shared utilities for processing resources for AI generation
 */

export type Resource = {
	resourceType: "text" | "file" | "image"
	resourceContent?: string
	resourceFileUrl?: string
}

/**
 * Extract text content from text resources
 */
export function extractTextContent(resources: Resource[]): string {
	return resources
		.map((r) => {
			if (r.resourceType === "text" && r.resourceContent) {
				return r.resourceContent
			}
			return null
		})
		.filter(Boolean)
		.join("\n\n")
}

/**
 * Extract file URLs from file resources
 */
export function extractFileUrls(resources: Resource[]): string[] {
	return resources
		.filter(
			(r): r is Resource & { resourceFileUrl: string } =>
				r.resourceType === "file" && Boolean(r.resourceFileUrl),
		)
		.map((r) => r.resourceFileUrl)
}

/**
 * Extract image URLs from image resources
 */
export function extractImageUrls(resources: Resource[]): string[] {
	return resources
		.filter(
			(r): r is Resource & { resourceFileUrl: string } =>
				r.resourceType === "image" && Boolean(r.resourceFileUrl),
		)
		.map((r) => r.resourceFileUrl)
}

/**
 * Combine text content with file URLs note
 */
export function buildTextContent(
	textContent: string,
	fileUrls: string[],
): string {
	if (textContent && fileUrls.length > 0) {
		return `${textContent}\n\nFiles to analyze: ${fileUrls.join(", ")}`
	}
	if (fileUrls.length > 0) {
		return `Files to analyze: ${fileUrls.join(", ")}`
	}
	return textContent
}
