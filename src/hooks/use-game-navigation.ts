import { useMemo } from "react"
import { api } from "@/trpc/react"

type Game = {
	id: string
	unitId: string
	orderIndex: number
}

type Unit = {
	id: string
	kurioId: string
	games: Game[]
	orderIndex: number
}

type UseGameNavigationReturn = {
	currentGame: Game | null
	nextGame: Game | null
	previousGame: Game | null
	allGames: Game[]
	totalGames: number
	currentIndex: number
}

export function useGameNavigation(
	kurioId: string,
	currentGameId: string,
): UseGameNavigationReturn {
	const { data: kurio } = api.kurio.getById.useQuery({ id: kurioId })

	const { currentGame, nextGame, previousGame, allGames } = useMemo(() => {
		if (!kurio) {
			return {
				currentGame: null,
				nextGame: null,
				previousGame: null,
				allGames: [],
			}
		}

		// Flatten all games with their paths
		const games: Array<{
			game: Game
			unitIndex: number
			gameIndex: number
		}> = []

		kurio.units.forEach((unit, unitIndex) => {
			unit.games.forEach((game, gameIndex) => {
				games.push({
					game,
					unitIndex,
					gameIndex,
				})
			})
		})

		const currentIndex = games.findIndex((g) => g.game.id === currentGameId)

		if (currentIndex === -1) {
			return {
				currentGame: null,
				nextGame: null,
				previousGame: null,
				allGames: games.map((g) => g.game),
			}
		}

		return {
			currentGame: games[currentIndex]?.game ?? null,
			nextGame: games[currentIndex + 1]?.game ?? null,
			previousGame: games[currentIndex - 1]?.game ?? null,
			allGames: games.map((g) => g.game),
		}
	}, [kurio, currentGameId])

	return {
		currentGame,
		nextGame,
		previousGame,
		allGames,
		totalGames: allGames.length,
		currentIndex: allGames.findIndex((g) => g.id === currentGameId),
	}
}
