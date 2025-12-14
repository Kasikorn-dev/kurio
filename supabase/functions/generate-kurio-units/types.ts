// Shared types for the Edge Function

export type Resource = {
	type: "text" | "file" | "image"
	content?: string
	fileUrl?: string
	filePath?: string
}

export type Game = {
	title: string
	gameType: "quiz" | "matching" | "fill_blank" | "multiple_choice"
	difficultyLevel: "easy" | "medium" | "hard"
	content: Record<string, unknown>
}

export type GenerationParams = {
	kurioId: string
	resources: Resource[]
	unitCount: number
	gamesPerUnit: number
	userId: string
}
