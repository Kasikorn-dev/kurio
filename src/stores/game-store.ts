import { create } from "zustand"

type GameState = {
	currentExerciseId: string | null
	selectedAnswer: Record<string, unknown> | null
	timeRemaining: number
	score: number
	startTime: number | null
	setCurrentExercise: (exerciseId: string) => void
	setAnswer: (answer: Record<string, unknown>) => void
	setTimeRemaining: (time: number) => void
	setScore: (score: number) => void
	startTimer: () => void
	reset: () => void
}

export const useGameStore = create<GameState>((set) => ({
	currentExerciseId: null,
	selectedAnswer: null,
	timeRemaining: 60,
	score: 0,
	startTime: null,
	setCurrentExercise: (exerciseId) =>
		set({ currentExerciseId: exerciseId, selectedAnswer: null }),
	setAnswer: (answer) => set({ selectedAnswer: answer }),
	setTimeRemaining: (time) => set({ timeRemaining: time }),
	setScore: (score) => set({ score }),
	startTimer: () => set({ startTime: Date.now() }),
	reset: () =>
		set({
			currentExerciseId: null,
			selectedAnswer: null,
			timeRemaining: 60,
			score: 0,
			startTime: null,
		}),
}))

