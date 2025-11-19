"use client"

type GameResultCardProps = {
	isCorrect: boolean
	correctAnswer?: string
	timeSpent: number
}

export function GameResultCard({
	isCorrect,
	correctAnswer,
	timeSpent,
}: GameResultCardProps) {
	return (
		<div
			className={`mt-2 rounded-md p-2 ${
				isCorrect
					? "bg-green-500/20 text-green-600"
					: "bg-red-500/20 text-red-600"
			}`}
		>
			{isCorrect ? "✓ Correct!" : "✗ Incorrect"}
			{!isCorrect && correctAnswer && (
				<p className="mt-1 text-sm">Correct answer: {correctAnswer}</p>
			)}
			<p className="mt-1 text-muted-foreground text-sm">Time: {timeSpent}s</p>
		</div>
	)
}
