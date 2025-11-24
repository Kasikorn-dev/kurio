/**
 * Shared types for Kurio components
 */

export type KurioResource = {
	id: string
	resourceType: string
	resourceContent: string | null
	resourceFileUrl: string | null
}

export type KurioGame = {
	id: string
	title: string
	orderIndex: number
	gameType: string
	difficultyLevel: "easy" | "medium" | "hard"
	content: Record<string, unknown>
}

export type KurioUnit = {
	id: string
	title: string
	orderIndex: number
	games: KurioGame[]
}

export type Kurio = {
	id: string
	title: string
	description: string | null
	status: string
	autoGenEnabled: boolean
	totalGames: number
	unitCount: number | null
	resources: KurioResource[]
	units: KurioUnit[]
}

export type KurioForPathViewer = {
	id: string
	title: string
	description: string | null
	status: string
	totalGames: number
	unitCount: number | null
	units: KurioUnit[]
}

export type KurioForCard = {
	id: string
	title: string
	description: string | null
	status: string
}

export type KurioForList = {
	id: string
	title: string
	description: string | null
	status: string
	createdAt: Date
	resources: Array<unknown>
}
