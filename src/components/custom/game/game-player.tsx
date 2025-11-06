"use client"

import { api } from "@/trpc/react"
import { ExerciseRenderer } from "./exercise-renderer"
import { ProgressTracker } from "./progress-tracker"

type GamePlayerProps = {
	kurioId: string
}

export function GamePlayer({ kurioId }: GamePlayerProps) {
	const { data: kurio } = api.kurio.getById.useQuery({ id: kurioId })

	if (!kurio) {
		return <div>Loading...</div>
	}

	// Get first exercise from first lesson of first unit
	const firstExercise =
		kurio.units[0]?.lessons[0]?.exercises[0] || null

	if (!firstExercise) {
		return <div>No exercises available</div>
	}

	return (
		<div className="container mx-auto py-8">
			<h1 className="mb-6 text-3xl font-bold">{kurio.title}</h1>
			<ProgressTracker kurioId={kurioId} />
			<div className="mt-8">
				<ExerciseRenderer exercise={firstExercise} />
			</div>
		</div>
	)
}

