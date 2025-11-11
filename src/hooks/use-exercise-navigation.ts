import { useMemo } from "react"
import { api } from "@/trpc/react"

type Exercise = {
	id: string
	lessonId: string
	orderIndex: number
}

type Lesson = {
	id: string
	unitId: string
	exercises: Exercise[]
	orderIndex: number
}

type Unit = {
	id: string
	lessons: Lesson[]
	orderIndex: number
}

export function useExerciseNavigation(
	kurioId: string,
	currentExerciseId: string,
) {
	const { data: kurio } = api.kurio.getById.useQuery({ id: kurioId })

	const { currentExercise, nextExercise, previousExercise, allExercises } =
		useMemo(() => {
			if (!kurio) {
				return {
					currentExercise: null,
					nextExercise: null,
					previousExercise: null,
					allExercises: [],
				}
			}

			// Flatten all exercises with their paths
			const exercises: Array<{
				exercise: Exercise
				unitIndex: number
				lessonIndex: number
				exerciseIndex: number
			}> = []

			kurio.units.forEach((unit, unitIndex) => {
				unit.lessons.forEach((lesson, lessonIndex) => {
					lesson.exercises.forEach((exercise, exerciseIndex) => {
						exercises.push({
							exercise,
							unitIndex,
							lessonIndex,
							exerciseIndex,
						})
					})
				})
			})

			const currentIndex = exercises.findIndex(
				(e) => e.exercise.id === currentExerciseId,
			)

			if (currentIndex === -1) {
				return {
					currentExercise: null,
					nextExercise: null,
					previousExercise: null,
					allExercises: exercises.map((e) => e.exercise),
				}
			}

			return {
				currentExercise: exercises[currentIndex]?.exercise ?? null,
				nextExercise: exercises[currentIndex + 1]?.exercise ?? null,
				previousExercise: exercises[currentIndex - 1]?.exercise ?? null,
				allExercises: exercises.map((e) => e.exercise),
			}
		}, [kurio, currentExerciseId])

	return {
		currentExercise,
		nextExercise,
		previousExercise,
		allExercises,
		totalExercises: allExercises.length,
		currentIndex: allExercises.findIndex((e) => e.id === currentExerciseId),
	}
}
