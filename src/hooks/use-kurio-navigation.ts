/**
 * Custom hook for Kurio detail page navigation
 * Handles unit and game navigation logic
 */

import { useRouter } from "next/navigation"
import { useState } from "react"

type Unit = {
	id: string
	title: string
	games: Array<{
		id: string
		title: string
		orderIndex: number
	}>
}

type UseKurioNavigationParams = {
	kurioId: string
	units: Unit[]
	unitId: string | null
	gameId: string | null
}

type UseKurioNavigationReturn = {
	direction: "forward" | "back"
	setDirection: (direction: "forward" | "back") => void
	goToJourney: () => void
	goToUnit: (unitId: string) => void
	goToNextGame: () => void
	goToPreviousGame: () => void
	hasNextGame: boolean
	hasPreviousGame: boolean
	currentUnit: (Unit & { title: string }) | undefined
	currentGame: { id: string; title: string } | undefined
	currentGameIndex: number
}

export function useKurioNavigation({
	kurioId,
	units,
	unitId,
	gameId,
}: UseKurioNavigationParams): UseKurioNavigationReturn {
	const router = useRouter()
	const [direction, setDirection] = useState<"forward" | "back">("forward")

	// Find current unit and game
	const currentUnit = units.find((u) => u.id === unitId)
	const currentGame = currentUnit?.games.find((g) => g.id === gameId)
	const currentGameIndex =
		currentUnit?.games.findIndex((g) => g.id === gameId) ?? -1

	// Navigation functions
	const goToJourney = () => {
		setDirection("back")
		router.push(`/kurio/${kurioId}`)
	}

	const goToUnit = (targetUnitId: string) => {
		setDirection("forward")
		const unit = units.find((u) => u.id === targetUnitId)
		const firstGame = unit?.games[0]
		if (firstGame) {
			router.push(`/kurio/${kurioId}?unit=${targetUnitId}&game=${firstGame.id}`)
		}
	}

	const goToNextGame = () => {
		if (!currentUnit || currentGameIndex === -1) return

		const nextGame = currentUnit.games[currentGameIndex + 1]
		if (nextGame) {
			setDirection("forward")
			router.push(`/kurio/${kurioId}?unit=${unitId}&game=${nextGame.id}`)
		} else {
			// Go to next unit's first game
			const currentUnitIndex = units.findIndex((u) => u.id === unitId)
			const nextUnit = units[currentUnitIndex + 1]
			const firstGame = nextUnit?.games[0]
			if (firstGame) {
				setDirection("forward")
				router.push(
					`/kurio/${kurioId}?unit=${nextUnit.id}&game=${firstGame.id}`,
				)
			}
		}
	}

	const goToPreviousGame = () => {
		if (!currentUnit || currentGameIndex === -1) return

		const prevGame = currentUnit.games[currentGameIndex - 1]
		if (prevGame) {
			setDirection("back")
			router.push(`/kurio/${kurioId}?unit=${unitId}&game=${prevGame.id}`)
		}
	}

	// Check if there's next/previous game
	const hasNextGame = (() => {
		if (!currentUnit || currentGameIndex === -1) return false
		if (currentGameIndex < currentUnit.games.length - 1) return true

		const currentUnitIndex = units.findIndex((u) => u.id === unitId)
		const nextUnit = units[currentUnitIndex + 1]
		return !!nextUnit && nextUnit.games.length > 0
	})()

	const hasPreviousGame = currentGameIndex > 0

	return {
		direction,
		setDirection,
		goToJourney,
		goToUnit,
		goToNextGame,
		goToPreviousGame,
		hasNextGame,
		hasPreviousGame,
		currentUnit,
		currentGame,
		currentGameIndex,
	}
}
