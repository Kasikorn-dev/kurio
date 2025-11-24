export function getProgressMessage(
	currentProgress: number,
	threshold: number,
): string {
	const remaining = threshold - currentProgress

	if (remaining <= 0) {
		return "You've reached the threshold! New content will be generated."
	}

	if (remaining <= 10) {
		return `Almost there! ${remaining}% more to unlock new content.`
	}

	if (remaining <= 25) {
		return `Keep going! ${remaining}% until new content unlocks.`
	}

	return `${currentProgress}% complete. ${remaining}% until new content.`
}

export function shouldShowProgressIndicator(
	autoGenEnabled: boolean,
	hasTriggered: boolean,
): boolean {
	return autoGenEnabled && !hasTriggered
}

// Re-export for convenience
export { calculateKurioProgress as calculateProgressPercentage } from "./progress-calculator"
