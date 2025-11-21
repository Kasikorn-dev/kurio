"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GameResultCard } from "./game-result-card"

type FillBlankGameProps = {
	title: string
	text: string
	blanks: Array<{ answer: string }>
	userBlanks: string[]
	onBlankChange: (index: number, value: string) => void
	onSubmit: () => void
	isSubmitted: boolean
	isCorrect: boolean | null
	timeSpent: number
}

export function FillBlankGame({
	title,
	text,
	blanks,
	userBlanks,
	onBlankChange,
	onSubmit,
	isSubmitted,
	isCorrect,
	timeSpent,
}: FillBlankGameProps) {
	// Split text by blanks and create input fields
	const parts = text.split(/_+/)

	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{isSubmitted && (
					<GameResultCard
						isCorrect={isCorrect ?? false}
						timeSpent={timeSpent}
					/>
				)}
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
					{parts.map((part, index) => (
						<span key={`part-${index}-${part.slice(0, 10)}`}>
							{part}
							{index < blanks.length && (
								<input
									className="mx-1 w-24 rounded-md border p-1 text-sm sm:text-base"
									disabled={isSubmitted}
									onChange={(e) => onBlankChange(index, e.target.value)}
									type="text"
									value={userBlanks[index] || ""}
								/>
							)}
						</span>
					))}
				</div>
				<Button
					disabled={userBlanks.some((b) => !b.trim()) || isSubmitted}
					onClick={onSubmit}
				>
					{isSubmitted ? "Submitted" : "Submit Answer"}
				</Button>
			</CardContent>
		</Card>
	)
}
