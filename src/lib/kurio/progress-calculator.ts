export type KurioProgress = {
	totalUnits: number
	completedUnits: number
	totalGames: number
	completedGames: number
}

export function calculateKurioProgress(progress: KurioProgress): number {
	if (progress.totalGames === 0) return 0

	const completionPercentage =
		(progress.completedGames / progress.totalGames) * 100

	return Math.round(completionPercentage)
}

export function shouldTriggerAutoGen(
	currentProgress: number,
	threshold: number,
	hasTriggered: boolean,
): boolean {
	// Only trigger once when reaching threshold
	return currentProgress >= threshold && !hasTriggered
}

export function calculateCompletedGames(
	unitProgress: Array<{ completedGames: number }>,
): number {
	return unitProgress.reduce((sum, unit) => sum + unit.completedGames, 0)
}
