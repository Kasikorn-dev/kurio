"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GameResultCard } from "./game-result-card"

type QuizGameProps = {
	title: string
	question: string
	correctAnswer: string
	answer: string
	onAnswerChange: (value: string) => void
	onSubmit: () => void
	isSubmitted: boolean
	isCorrect: boolean | null
	timeSpent: number
}

export function QuizGame({
	title,
	question,
	correctAnswer,
	answer,
	onAnswerChange,
	onSubmit,
	isSubmitted,
	isCorrect,
	timeSpent,
}: QuizGameProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{isSubmitted && (
					<GameResultCard
						correctAnswer={correctAnswer}
						isCorrect={isCorrect ?? false}
						timeSpent={timeSpent}
					/>
				)}
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<p className="text-sm sm:text-base">{question}</p>
				<input
					className="rounded-md border p-2 text-sm sm:text-base"
					disabled={isSubmitted}
					onChange={(e) => onAnswerChange(e.target.value)}
					placeholder="Type your answer..."
					type="text"
					value={answer}
				/>
				<Button disabled={!answer || isSubmitted} onClick={onSubmit}>
					{isSubmitted ? "Submitted" : "Submit Answer"}
				</Button>
			</CardContent>
		</Card>
	)
}
