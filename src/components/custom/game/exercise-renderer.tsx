"use client"

import { api } from "@/trpc/react"
import { useGameStore } from "@/stores/game-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ExerciseRendererProps = {
	exercise: {
		id: string
		title: string
		exerciseType: string
		content: Record<string, unknown>
	}
}

export function ExerciseRenderer({ exercise }: ExerciseRendererProps) {
	const { selectedAnswer, setAnswer } = useGameStore()
	const submitAnswer = api.game.submitAnswer.useMutation()

	const handleSubmit = async () => {
		if (!selectedAnswer) return

		// This is a simplified version - you'd need to check the answer against the correct answer
		const isCorrect = true // TODO: Implement actual answer checking

		await submitAnswer.mutateAsync({
			exerciseId: exercise.id,
			userAnswer: selectedAnswer,
			isCorrect,
			score: isCorrect ? 10 : 0,
			timeSpent: 0, // TODO: Calculate actual time spent
		})
	}

	if (exercise.exerciseType === "multiple_choice") {
		const options = (exercise.content.options as string[]) || []
		const question = (exercise.content.question as string) || ""

		return (
			<Card>
				<CardHeader>
					<CardTitle>{exercise.title}</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<p>{question}</p>
					<div className="flex flex-col gap-2">
						{options.map((option, index) => (
							<Button
								key={index}
								variant={
									selectedAnswer?.selected === index ? "default" : "outline"
								}
								onClick={() => setAnswer({ selected: index })}
							>
								{option}
							</Button>
						))}
					</div>
					<Button onClick={handleSubmit} disabled={!selectedAnswer}>
						Submit Answer
					</Button>
				</CardContent>
			</Card>
		)
	}

	// Add other exercise types here (quiz, matching, fill_blank)
	return (
		<Card>
			<CardHeader>
				<CardTitle>{exercise.title}</CardTitle>
			</CardHeader>
			<CardContent>
				<p>Exercise type: {exercise.exerciseType}</p>
			</CardContent>
		</Card>
	)
}

