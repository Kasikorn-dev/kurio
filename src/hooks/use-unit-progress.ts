import { api } from "@/trpc/react"

type UseUnitProgressReturn = {
	totalUnits: number
	completedUnits: number
	progressPercentage: number
}

export function useUnitProgress(kurioId: string): UseUnitProgressReturn {
	const { data: kurio } = api.kurio.getById.useQuery({ id: kurioId })

	const allUnitIds = kurio?.units.map((unit) => unit.id) ?? []

	const { data: allProgress } = api.game.getAllUnitProgress.useQuery(
		{ unitIds: allUnitIds },
		{ enabled: allUnitIds.length > 0 },
	)

	const completedUnits =
		allProgress?.filter((progress) => progress?.isCompleted === true).length ??
		0

	const totalUnits = allUnitIds.length
	const progressPercentage =
		totalUnits > 0 ? (completedUnits / totalUnits) * 100 : 0

	return {
		totalUnits,
		completedUnits,
		progressPercentage,
	}
}
