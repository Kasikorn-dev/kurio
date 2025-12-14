import type { Resource } from "../generate-kurio-units/types.ts"

export type ProcessedResources = {
	textContent: string
	fileFilePaths: string[]
	imageFilePaths: string[]
}

export function extractTextContent(resources: Resource[]): string {
	return resources
		.filter((r) => r.type === "text" && r.content)
		.map((r) => r.content)
		.join("\n\n")
}

export function extractFileFilePaths(resources: Resource[]): string[] {
	return resources
		.filter((r) => r.type === "file" && r.filePath)
		.map((r) => r.filePath as string)
}

export function extractImageFilePaths(resources: Resource[]): string[] {
	return resources
		.filter((r) => r.type === "image" && r.filePath)
		.map((r) => r.filePath as string)
}

/**
 * Process resources once - extract all content and file paths
 * This should be called once before PHASE 1 and the result passed to all generation functions
 */
export function processResources(resources: Resource[]): ProcessedResources {
	return {
		textContent: extractTextContent(resources),
		fileFilePaths: extractFileFilePaths(resources),
		imageFilePaths: extractImageFilePaths(resources),
	}
}
