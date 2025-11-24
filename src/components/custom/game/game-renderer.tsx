"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { FillBlankGame } from "@/components/custom/game/fill-blank-game"
import { MatchingGame } from "@/components/custom/game/matching-game"
import { MultipleChoiceGame } from "@/components/custom/game/multiple-choice-game"
import { QuizGame } from "@/components/custom/game/quiz-game"
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

	// Game-specific state - initialize all hooks at top level
	const [quizAnswer, setQuizAnswer] = useState("")
	const [fillBlankAnswers, setFillBlankAnswers] = useState<string[]>([])
	const [matchingSelectedLeft, setMatchingSelectedLeft] = useState<
		string | null
	>(null)
	const [matchingMatches, setMatchingMatches] = useState<
		Array<{ left: string; right: string | null }>
	>([])

	// Initialize game-specific state based on game type
	useEffect(() => {
		start()
		setSelectedAnswer(null)
		setIsSubmitted(false)
		setIsCorrect(null)
		setQuizAnswer("")
		setFillBlankAnswers([])
		setMatchingSelectedLeft(null)
		setMatchingMatches([])

		// Initialize matching game state
		if (game.gameType === "matching") {
			const leftItems = (game.content.leftItems as string[]) || []
			setMatchingMatches(leftItems.map((left) => ({ left, right: null })))
		}

		// Initialize fill blank game state
		if (game.gameType === "fill_blank") {
			const blanks = (game.content.blanks as Array<{ answer: string }>) || []
			setFillBlankAnswers(new Array(blanks.length).fill(""))
		}

		return () => {
			stop()
		}
	}, [start, stop, game.gameType, game.content])

	const handleSubmit = async (): Promise<void> => {
		if (!selectedAnswer) return

		stop()
		const correct = checkAnswer(game.gameType, game.content, selectedAnswer)
		setIsCorrect(correct)
		setIsSubmitted(true)

		const score = calculateScore(correct, game.difficultyLevel, timeSpent)

		try {
			// Submit answer (optimized - faster now)
			await submitAnswer.mutateAsync({
				gameId: game.id,
				userAnswer: selectedAnswer,
				isCorrect: correct,
				score,
				timeSpent,
			})

			if (correct) {
				toast.success(`Correct! You scored ${score} points.`)
				// Auto-advance to next game if correct
				if (onComplete) {
					// Small delay for toast visibility, then auto-advance
					// setTimeout(() => {
					onComplete()
					reset()
					setIsSubmitted(false)
					setIsCorrect(null)
					setSelectedAnswer(null)
					// }, 800) // Reduced from TIMING_CONSTANTS.GAME_COMPLETION_DELAY
				}
			} else {
				toast.error("Incorrect. Try again!")
				// Don't auto-advance if incorrect - let user try again
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to submit answer"
			toast.error(errorMessage)
			// Reset state on error so user can try again
			setIsSubmitted(false)
			setIsCorrect(null)
		}
	}

	if (game.gameType === "multiple_choice") {
		const options = (game.content.options as string[]) || []
		const question = (game.content.question as string) || ""
		const correctAnswer = game.content.correctAnswer as number | undefined

		return (
			<MultipleChoiceGame
				correctAnswer={correctAnswer}
				isCorrect={isCorrect}
				isSubmitted={isSubmitted}
				onAnswerSelect={(index) => setSelectedAnswer({ selected: index })}
				onSubmit={handleSubmit}
				options={options}
				question={question}
				selectedAnswer={selectedAnswer}
				timeSpent={timeSpent}
				title={game.title}
			/>
		)
	}

	if (game.gameType === "quiz") {
		const question = (game.content.question as string) || ""
		const correctAnswer = (game.content.correctAnswer as string) || ""

		return (
			<QuizGame
				answer={quizAnswer}
				correctAnswer={correctAnswer}
				isCorrect={isCorrect}
				isSubmitted={isSubmitted}
				onAnswerChange={(value) => {
					setQuizAnswer(value)
					setSelectedAnswer({ answer: value })
				}}
				onSubmit={handleSubmit}
				question={question}
				timeSpent={timeSpent}
				title={game.title}
			/>
		)
	}

	if (game.gameType === "fill_blank") {
		const text = (game.content.text as string) || ""
		const blanks = (game.content.blanks as Array<{ answer: string }>) || []

		return (
			<FillBlankGame
				blanks={blanks}
				isCorrect={isCorrect}
				isSubmitted={isSubmitted}
				onBlankChange={(index, value) => {
					const newBlanks = [...fillBlankAnswers]
					newBlanks[index] = value
					setFillBlankAnswers(newBlanks)
					setSelectedAnswer({ blanks: newBlanks })
				}}
				onSubmit={handleSubmit}
				text={text}
				timeSpent={timeSpent}
				title={game.title}
				userBlanks={fillBlankAnswers}
			/>
		)
	}

	if (game.gameType === "matching") {
		const leftItems = (game.content.leftItems as string[]) || []
		const rightItems = (game.content.rightItems as string[]) || []

		const handleLeftClick = (left: string): void => {
			if (matchingSelectedLeft === left) {
				setMatchingSelectedLeft(null)
			} else {
				setMatchingSelectedLeft(left)
			}
		}

		const handleRightClick = (right: string): void => {
			if (!matchingSelectedLeft) return

			const newMatches = matchingMatches.map((match) =>
				match.left === matchingSelectedLeft ? { ...match, right } : match,
			)
			setMatchingMatches(newMatches)
			setSelectedAnswer({ pairs: newMatches.filter((m) => m.right !== null) })
			setMatchingSelectedLeft(null)
		}

		return (
			<MatchingGame
				isCorrect={isCorrect}
				isSubmitted={isSubmitted}
				leftItems={leftItems}
				matches={matchingMatches}
				onLeftClick={handleLeftClick}
				onRightClick={handleRightClick}
				onSubmit={handleSubmit}
				rightItems={rightItems}
				selectedLeft={matchingSelectedLeft}
				timeSpent={timeSpent}
				title={game.title}
			/>
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
