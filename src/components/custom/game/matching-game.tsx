"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GameResultCard } from "./game-result-card"

type MatchingGameProps = {
	title: string
	leftItems: string[]
	rightItems: string[]
	selectedLeft: string | null
	matches: Array<{ left: string; right: string | null }>
	onLeftClick: (left: string) => void
	onRightClick: (right: string) => void
	onSubmit: () => void
	isSubmitted: boolean
	isCorrect: boolean | null
	timeSpent: number
}

export function MatchingGame({
	title,
	leftItems,
	rightItems,
	selectedLeft,
	matches,
	onLeftClick,
	onRightClick,
	onSubmit,
	isSubmitted,
	isCorrect,
	timeSpent,
}: MatchingGameProps) {
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
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="flex flex-col gap-2">
						<h3 className="font-semibold text-sm sm:text-base">Left</h3>
						{leftItems.map((left) => (
							<Button
								disabled={isSubmitted}
								key={`left-${left}`}
								onClick={() => onLeftClick(left)}
								variant={
									selectedLeft === left
										? "default"
										: matches.find((m) => m.left === left)?.right
											? "secondary"
											: "outline"
								}
								className="text-sm sm:text-base"
							>
								{left}
							</Button>
						))}
					</div>
					<div className="flex flex-col gap-2">
						<h3 className="font-semibold text-sm sm:text-base">Right</h3>
						{rightItems.map((right) => {
							const matchedLeft = matches.find((m) => m.right === right)?.left
							return (
								<Button
									disabled={isSubmitted || !!matchedLeft}
									key={`right-${right}`}
									onClick={() => onRightClick(right)}
									variant={matchedLeft ? "secondary" : "outline"}
									className="text-sm sm:text-base"
								>
									{right} {matchedLeft && `(${matchedLeft})`}
								</Button>
							)
						})}
					</div>
				</div>
				<Button
					disabled={matches.some((m) => !m.right) || isSubmitted}
					onClick={onSubmit}
				>
					{isSubmitted ? "Submitted" : "Submit Answer"}
				</Button>
			</CardContent>
		</Card>
	)
}
