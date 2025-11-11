import { api } from "@/trpc/react"

export function useLessonProgress(kurioId: string) {
	const { data: kurio } = api.kurio.getById.useQuery({ id: kurioId })

	const allLessonIds =
		kurio?.units.flatMap((unit) => unit.lessons.map((lesson) => lesson.id)) ??
		[]

	const { data: allProgress } = api.game.getAllLessonProgress.useQuery(
		{ lessonIds: allLessonIds },
		{ enabled: allLessonIds.length > 0 },
	)

	const completedLessons =
		allProgress?.filter((progress) => progress?.isCompleted === true).length ??
		0

	const totalLessons = allLessonIds.length
	const progressPercentage =
		totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

	return {
		totalLessons,
		completedLessons,
		progressPercentage,
	}
}
