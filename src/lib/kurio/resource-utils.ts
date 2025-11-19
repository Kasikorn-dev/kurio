import { UI_CONSTANTS } from "@/lib/constants"

type Resource = {
	resourceType: "text" | "file" | "image"
	resourceContent?: string
	resourceFileUrl?: string
	resourceFileType?: string
	orderIndex: number
}

export type ExtractedKurioData = {
	title: string
	description?: string
}

/**
 * Extract title and description from resources
 * Title: First N chars from first text resource or first file name
 * Description: First N chars from all text resources combined
 */
export function extractKurioData(resources: Resource[]): ExtractedKurioData {
	const firstTextResource = resources.find((r) => r.resourceType === "text")
	const firstFile = resources.find(
		(r) => r.resourceType === "file" || r.resourceType === "image",
	)

	const title =
		firstTextResource?.resourceContent?.slice(
			0,
			UI_CONSTANTS.CHAR_LIMITS.KURIO_TITLE,
		) ||
		firstFile?.resourceFileUrl
			?.split("/")
			.pop()
			?.slice(0, UI_CONSTANTS.CHAR_LIMITS.KURIO_TITLE) ||
		"New Kurio"

	const textResources = resources
		.filter((r) => r.resourceType === "text")
		.map((r) => r.resourceContent)
		.join("\n\n")
	const description =
		textResources.slice(0, UI_CONSTANTS.CHAR_LIMITS.KURIO_DESCRIPTION) ||
		undefined

	return { title, description }
}
