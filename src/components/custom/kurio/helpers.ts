/**
 * Helper functions for Kurio components
 */

/**
 * Calculate unit position in snake pattern (center-right-center-left)
 */
export function calculateUnitPosition(
	index: number,
): "center" | "left" | "right" {
	const pattern = index % 4
	if (pattern === 0 || pattern === 2) return "center"
	if (pattern === 1) return "right"
	return "left"
}

/**
 * Calculate progress percentage
 */
export function calculateProgressPercentage(
	completed: number,
	total: number,
): number {
	if (total === 0) return 0
	return Math.round((completed / total) * 100)
}

/**
 * Check if unit is locked (previous unit must be completed)
 */
export function isUnitLocked(
	index: number,
	units: Array<{ id: string }>,
	unitProgressMap: Map<string, { isCompleted: boolean }>,
): boolean {
	if (index === 0) return false

	const previousUnit = units[index - 1]
	if (!previousUnit) return false

	const previousProgress = unitProgressMap.get(previousUnit.id)
	return previousProgress?.isCompleted === false
}
