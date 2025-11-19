import { GAME_CONSTANTS } from "@/lib/constants"

type ExerciseContent = Record<string, unknown>

// Type guards for safer type checking
function isNumber(value: unknown): value is number {
	return typeof value === "number"
}

function isString(value: unknown): value is string {
	return typeof value === "string"
}

function isArrayOf<T>(
	value: unknown,
	itemGuard: (item: unknown) => item is T,
): value is T[] {
	return Array.isArray(value) && value.every(itemGuard)
}

function isBlankItem(value: unknown): value is { answer: string } {
	return (
		typeof value === "object" &&
		value !== null &&
		"answer" in value &&
		isString(value.answer)
	)
}

function isPairItem(value: unknown): value is { left: string; right: string } {
	return (
		typeof value === "object" &&
		value !== null &&
		"left" in value &&
		"right" in value &&
		isString(value.left) &&
		isString(value.right)
	)
}

export function checkAnswer(
	exerciseType: string,
	content: ExerciseContent,
	userAnswer: Record<string, unknown>,
): boolean {
	switch (exerciseType) {
		case "multiple_choice": {
			const correctAnswer = isNumber(content.correctAnswer)
				? content.correctAnswer
				: undefined
			const selected = isNumber(userAnswer.selected)
				? userAnswer.selected
				: undefined
			return correctAnswer !== undefined && selected === correctAnswer
		}

		case "quiz": {
			const correctAnswer = isString(content.correctAnswer)
				? content.correctAnswer
				: undefined
			const userAnswerText = isString(userAnswer.answer)
				? userAnswer.answer
				: undefined
			return (
				correctAnswer !== undefined &&
				userAnswerText !== undefined &&
				userAnswerText.trim().toLowerCase() ===
					correctAnswer.trim().toLowerCase()
			)
		}

		case "fill_blank": {
			const blanks = isArrayOf(content.blanks, isBlankItem)
				? content.blanks
				: undefined
			const userBlanks = isArrayOf(userAnswer.blanks, isString)
				? userAnswer.blanks
				: undefined

			if (!blanks || !userBlanks || blanks.length !== userBlanks.length) {
				return false
			}

			return blanks.every(
				(blank, index) =>
					blank.answer.trim().toLowerCase() ===
					userBlanks[index]?.trim().toLowerCase(),
			)
		}

		case "matching": {
			const pairs = isArrayOf(content.pairs, isPairItem)
				? content.pairs
				: undefined
			const userPairs = isArrayOf(userAnswer.pairs, isPairItem)
				? userAnswer.pairs
				: undefined

			if (!pairs || !userPairs || pairs.length !== userPairs.length) {
				return false
			}

			return pairs.every((pair) =>
				userPairs.some(
					(userPair) =>
						userPair.left === pair.left && userPair.right === pair.right,
				),
			)
		}

		default:
			return false
	}
}

export function calculateScore(
	isCorrect: boolean,
	difficultyLevel: "easy" | "medium" | "hard",
	timeSpent: number,
): number {
	if (!isCorrect) return 0

	const baseScore = {
		easy: GAME_CONSTANTS.BASE_SCORES.EASY,
		medium: GAME_CONSTANTS.BASE_SCORES.MEDIUM,
		hard: GAME_CONSTANTS.BASE_SCORES.HARD,
	}[difficultyLevel]

	// Bonus for quick answers
	const timeBonus =
		timeSpent < GAME_CONSTANTS.TIME_BONUS.THRESHOLD
			? GAME_CONSTANTS.TIME_BONUS.AMOUNT
			: 0

	return baseScore + timeBonus
}
