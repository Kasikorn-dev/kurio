"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GameResultCard } from "./game-result-card"

type MultipleChoiceGameProps = {
	title: string
	question: string
	options: string[]
	correctAnswer: number | undefined
	selectedAnswer: Record<string, unknown> | null
	onAnswerSelect: (index: number) => void
	onSubmit: () => void
	isSubmitted: boolean
	isCorrect: boolean | null
	timeSpent: number
}

export function MultipleChoiceGame({
	title,
	question,
	options,
	correctAnswer,
	selectedAnswer,
	onAnswerSelect,
	onSubmit,
	isSubmitted,
	isCorrect,
	timeSpent,
}: MultipleChoiceGameProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{isSubmitted && (
					<GameResultCard
						correctAnswer={
							correctAnswer !== undefined ? options[correctAnswer] : undefined
						}
						isCorrect={isCorrect ?? false}
						timeSpent={timeSpent}
					/>
				)}
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<p className="text-sm sm:text-base">{question}</p>
				<div className="flex flex-col gap-2">
					{options.map((option, index) => (
						<Button
							disabled={isSubmitted}
							key={`option-${index}-${option}`}
							onClick={() => onAnswerSelect(index)}
							variant={
								selectedAnswer?.selected === index ? "default" : "outline"
							}
						>
							{option}
						</Button>
					))}
				</div>
				<Button disabled={!selectedAnswer || isSubmitted} onClick={onSubmit}>
					{isSubmitted ? "Submitted" : "Submit Answer"}
				</Button>
			</CardContent>
		</Card>
	)
}
