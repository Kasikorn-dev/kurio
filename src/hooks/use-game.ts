import { api } from "@/trpc/react"
import { useGameStore } from "@/stores/game-store"

export function useGame() {
	const getExercise = api.game.getExercise.useQuery
	const submitAnswer = api.game.submitAnswer.useMutation()
	const getLessonProgress = api.game.getLessonProgress.useQuery
	const generateGame = api.game.generateGame.useMutation()
	const { setCurrentExercise, setAnswer, reset } = useGameStore()

	return {
		getExercise,
		submitAnswer,
		getLessonProgress,
		generateGame,
		setCurrentExercise,
		setAnswer,
		reset,
	}
}

