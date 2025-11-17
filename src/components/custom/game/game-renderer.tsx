"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useExerciseTimer } from "@/hooks/use-exercise-timer"
import { calculateScore, checkAnswer } from "@/lib/game/answer-checker"
import { api } from "@/trpc/react"

type GameRendererProps = {
	game: {
		id: string
		title: string
		gameType: string
		difficultyLevel: "easy" | "medium" | "hard"
		content: Record<string, unknown>
	}
	onComplete?: () => void
}

export function GameRenderer({ game, onComplete }: GameRendererProps) {
	const [selectedAnswer, setSelectedAnswer] = useState<Record<
		string,
		unknown
	> | null>(null)
	const { timeSpent, start, stop, reset } = useExerciseTimer()
	const submitAnswer = api.game.submitAnswer.useMutation()
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

	useEffect(() => {
		start()
		setSelectedAnswer(null)
		setIsSubmitted(false)
		setIsCorrect(null)
		return () => {
			stop()
		}
	}, [start, stop])

	const handleSubmit = async () => {
		if (!selectedAnswer) return

		stop()
		const correct = checkAnswer(game.gameType, game.content, selectedAnswer)
		setIsCorrect(correct)
		setIsSubmitted(true)

		const score = calculateScore(correct, game.difficultyLevel, timeSpent)

		try {
			await submitAnswer.mutateAsync({
				gameId: game.id,
				userAnswer: selectedAnswer,
				isCorrect: correct,
				score,
				timeSpent,
			})

			if (correct) {
				toast.success(`Correct! You scored ${score} points.`)
			} else {
				toast.error("Incorrect. Try again!")
			}

			if (onComplete) {
				setTimeout(() => {
					onComplete()
					reset()
					setIsSubmitted(false)
					setIsCorrect(null)
					setSelectedAnswer(null)
				}, 2000)
			}
		} catch (error) {
			toast.error("Failed to submit answer")
			console.error(error)
		}
	}

	if (game.gameType === "multiple_choice") {
		const options = (game.content.options as string[]) || []
		const question = (game.content.question as string) || ""
		const correctAnswer = game.content.correctAnswer as number | undefined

		return (
			<Card>
				<CardHeader>
					<CardTitle>{game.title}</CardTitle>
					{isSubmitted && (
						<div
							className={`mt-2 rounded-md p-2 ${
								isCorrect
									? "bg-green-500/20 text-green-600"
									: "bg-red-500/20 text-red-600"
							}`}
						>
							{isCorrect ? "✓ Correct!" : "✗ Incorrect"}
							{!isCorrect && correctAnswer !== undefined && (
								<p className="mt-1 text-sm">
									Correct answer: {options[correctAnswer]}
								</p>
							)}
						</div>
					)}
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<p>{question}</p>
					<div className="flex flex-col gap-2">
						{options.map((option, index) => (
							<Button
								disabled={isSubmitted}
								key={`option-${index}-${option}`}
								onClick={() => setSelectedAnswer({ selected: index })}
								variant={
									selectedAnswer?.selected === index ? "default" : "outline"
								}
							>
								{option}
							</Button>
						))}
					</div>
					<Button
						disabled={!selectedAnswer || isSubmitted}
						onClick={handleSubmit}
					>
						{isSubmitted ? "Submitted" : "Submit Answer"}
					</Button>
					{isSubmitted && (
						<p className="text-muted-foreground text-sm">Time: {timeSpent}s</p>
					)}
				</CardContent>
			</Card>
		)
	}

	if (game.gameType === "quiz") {
		const question = (game.content.question as string) || ""
		const correctAnswer = (game.content.correctAnswer as string) || ""
		const [answer, setAnswerText] = useState("")

		return (
			<Card>
				<CardHeader>
					<CardTitle>{game.title}</CardTitle>
					{isSubmitted && (
						<div
							className={`mt-2 rounded-md p-2 ${
								isCorrect
									? "bg-green-500/20 text-green-600"
									: "bg-red-500/20 text-red-600"
							}`}
						>
							{isCorrect ? "✓ Correct!" : "✗ Incorrect"}
							{!isCorrect && (
								<p className="mt-1 text-sm">Correct answer: {correctAnswer}</p>
							)}
						</div>
					)}
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<p>{question}</p>
					<input
						className="rounded-md border p-2"
						disabled={isSubmitted}
						onChange={(e) => {
							setAnswerText(e.target.value)
							setSelectedAnswer({ answer: e.target.value })
						}}
						placeholder="Type your answer..."
						type="text"
						value={answer}
					/>
					<Button disabled={!answer || isSubmitted} onClick={handleSubmit}>
						{isSubmitted ? "Submitted" : "Submit Answer"}
					</Button>
					{isSubmitted && (
						<p className="text-muted-foreground text-sm">Time: {timeSpent}s</p>
					)}
				</CardContent>
			</Card>
		)
	}

	if (game.gameType === "fill_blank") {
		const text = (game.content.text as string) || ""
		const blanks = (game.content.blanks as Array<{ answer: string }>) || []
		const [userBlanks, setUserBlanks] = useState<string[]>(
			new Array(blanks.length).fill(""),
		)

		// Split text by blanks and create input fields
		const parts = text.split(/_+/)
		const blankIndices: number[] = []
		const _currentIndex = 0
		for (let i = 0; i < text.length; i++) {
			if (text.slice(i).startsWith("_")) {
				blankIndices.push(blankIndices.length)
				while (text[i] === "_") i++
				i--
			}
		}

		return (
			<Card>
				<CardHeader>
					<CardTitle>{game.title}</CardTitle>
					{isSubmitted && (
						<div
							className={`mt-2 rounded-md p-2 ${
								isCorrect
									? "bg-green-500/20 text-green-600"
									: "bg-red-500/20 text-red-600"
							}`}
						>
							{isCorrect ? "✓ Correct!" : "✗ Incorrect"}
						</div>
					)}
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="flex flex-wrap items-center gap-2">
						{parts.map((part, index) => (
							<span key={`part-${index}-${part.slice(0, 10)}`}>
								{part}
								{index < blanks.length && (
									<input
										className="mx-1 w-24 rounded-md border p-1"
										disabled={isSubmitted}
										onChange={(e) => {
											const newBlanks = [...userBlanks]
											newBlanks[index] = e.target.value
											setUserBlanks(newBlanks)
											setSelectedAnswer({ blanks: newBlanks })
										}}
										type="text"
										value={userBlanks[index] || ""}
									/>
								)}
							</span>
						))}
					</div>
					<Button
						disabled={userBlanks.some((b) => !b.trim()) || isSubmitted}
						onClick={handleSubmit}
					>
						{isSubmitted ? "Submitted" : "Submit Answer"}
					</Button>
					{isSubmitted && (
						<p className="text-muted-foreground text-sm">Time: {timeSpent}s</p>
					)}
				</CardContent>
			</Card>
		)
	}

	if (game.gameType === "matching") {
		const leftItems = (game.content.leftItems as string[]) || []
		const rightItems = (game.content.rightItems as string[]) || []
		const _pairs =
			(game.content.pairs as Array<{ left: string; right: string }>) || []
		const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
		const [matches, setMatches] = useState<
			Array<{ left: string; right: string | null }>
		>(leftItems.map((left) => ({ left, right: null })))

		const handleLeftClick = (left: string) => {
			if (selectedLeft === left) {
				setSelectedLeft(null)
			} else {
				setSelectedLeft(left)
			}
		}

		const handleRightClick = (right: string) => {
			if (!selectedLeft) return

			const newMatches = matches.map((match) =>
				match.left === selectedLeft ? { ...match, right } : match,
			)
			setMatches(newMatches)
			setSelectedAnswer({ pairs: newMatches.filter((m) => m.right !== null) })
			setSelectedLeft(null)
		}

		return (
			<Card>
				<CardHeader>
					<CardTitle>{game.title}</CardTitle>
					{isSubmitted && (
						<div
							className={`mt-2 rounded-md p-2 ${
								isCorrect
									? "bg-green-500/20 text-green-600"
									: "bg-red-500/20 text-red-600"
							}`}
						>
							{isCorrect ? "✓ Correct!" : "✗ Incorrect"}
						</div>
					)}
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="flex flex-col gap-2">
							<h3 className="font-semibold">Left</h3>
							{leftItems.map((left) => (
								<Button
									disabled={isSubmitted}
									key={`left-${left}`}
									onClick={() => handleLeftClick(left)}
									variant={
										selectedLeft === left
											? "default"
											: matches.find((m) => m.left === left)?.right
												? "secondary"
												: "outline"
									}
								>
									{left}
								</Button>
							))}
						</div>
						<div className="flex flex-col gap-2">
							<h3 className="font-semibold">Right</h3>
							{rightItems.map((right) => {
								const matchedLeft = matches.find((m) => m.right === right)?.left
								return (
									<Button
										disabled={isSubmitted || !!matchedLeft}
										key={`right-${right}`}
										onClick={() => handleRightClick(right)}
										variant={matchedLeft ? "secondary" : "outline"}
									>
										{right} {matchedLeft && `(${matchedLeft})`}
									</Button>
								)
							})}
						</div>
					</div>
					<Button
						disabled={matches.some((m) => !m.right) || isSubmitted}
						onClick={handleSubmit}
					>
						{isSubmitted ? "Submitted" : "Submit Answer"}
					</Button>
					{isSubmitted && (
						<p className="text-muted-foreground text-sm">Time: {timeSpent}s</p>
					)}
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{game.title}</CardTitle>
			</CardHeader>
			<CardContent>
				<p>Game type: {game.gameType} is not yet implemented</p>
			</CardContent>
		</Card>
	)
}
