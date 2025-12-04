/**
 * Shared types for Kurio components
 */

export type ResourceType = "text" | "file" | "image"
export type KurioStatus =
	| "draft"
	| "generating"
	| "generating_units"
	| "generating_games"
	| "ready"
	| "error"
export type UnitStatus = "generating" | "ready" | "error"
export type GameType = "quiz" | "matching" | "fill_blank" | "multiple_choice"
export type DifficultyLevel = "easy" | "medium" | "hard"

export type KurioResource = {
	id: string
	type: ResourceType
	content: string | null
	fileUrl: string | null
}

export type KurioGame = {
	id: string
	title: string
	orderIndex: number
	gameType: GameType
	difficultyLevel: DifficultyLevel
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
	status: KurioStatus
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
	status: KurioStatus
	totalGames: number
	unitCount: number | null
	units: KurioUnit[]
}

export type KurioForCard = {
	id: string
	title: string
	description: string | null
	status: KurioStatus
}

export type KurioForList = {
	id: string
	title: string
	description: string | null
	status: KurioStatus
	createdAt: Date
	resources: Array<unknown>
}
