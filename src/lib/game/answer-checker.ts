type ExerciseContent = Record<string, unknown>

export function checkAnswer(
	exerciseType: string,
	content: ExerciseContent,
	userAnswer: Record<string, unknown>,
): boolean {
	switch (exerciseType) {
		case "multiple_choice": {
			const correctAnswer = content.correctAnswer as number | undefined
			const selected = userAnswer.selected as number | undefined
			return correctAnswer !== undefined && selected === correctAnswer
		}

		case "quiz": {
			const correctAnswer = content.correctAnswer as string | undefined
			const userAnswerText = userAnswer.answer as string | undefined
			return (
				correctAnswer !== undefined &&
				userAnswerText !== undefined &&
				userAnswerText.trim().toLowerCase() ===
					correctAnswer.trim().toLowerCase()
			)
		}

		case "fill_blank": {
			const blanks = content.blanks as Array<{ answer: string }> | undefined
			const userBlanks = userAnswer.blanks as string[] | undefined

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
			const pairs = content.pairs as
				| Array<{
						left: string
						right: string
				  }>
				| undefined
			const userPairs = userAnswer.pairs as
				| Array<{
						left: string
						right: string
				  }>
				| undefined

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
		easy: 5,
		medium: 10,
		hard: 15,
	}[difficultyLevel]

	// Bonus for quick answers (under 30 seconds)
	const timeBonus = timeSpent < 30 ? 5 : 0

	return baseScore + timeBonus
}
