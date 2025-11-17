"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useGameNavigation } from "@/hooks/use-game-navigation"
import { api } from "@/trpc/react"
import { GamePlayerSkeleton } from "./game-player-skeleton"
import { GameRenderer } from "./game-renderer"
import { ProgressTracker } from "./progress-tracker"

type GamePlayerProps = {
	kurioId: string
}

export function GamePlayer({ kurioId }: GamePlayerProps) {
	const { data: kurio, isLoading } = api.kurio.getById.useQuery({ id: kurioId })
	const firstGame = kurio?.units[0]?.games[0]
	const [currentGameId, setCurrentGameId] = useState(firstGame?.id ?? "")

	const { nextGame, previousGame, currentIndex, totalGames } =
		useGameNavigation(kurioId, currentGameId)

	if (isLoading || !kurio) {
		return <GamePlayerSkeleton />
	}

	if (!firstGame) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center">
					<p className="text-muted-foreground">No games available</p>
					<p className="mt-2 text-muted-foreground text-sm">
						Generate game content first
					</p>
				</div>
			</div>
		)
	}

	const currentGame =
		kurio.units
			.flatMap((unit) => unit.games)
			.find((g) => g.id === currentGameId) ?? firstGame

	const handleNext = () => {
		if (nextGame) {
			setCurrentGameId(nextGame.id)
		}
	}

	const handlePrevious = () => {
		if (previousGame) {
			setCurrentGameId(previousGame.id)
		}
	}

	const handleComplete = () => {
		if (nextGame) {
			setTimeout(() => {
				setCurrentGameId(nextGame.id)
			}, 2000)
		}
	}

	return (
		<div className="container mx-auto py-8">
			<h1 className="mb-6 font-bold text-3xl">{kurio.title}</h1>
			<ProgressTracker kurioId={kurioId} />
			<div className="mb-4 flex items-center justify-between">
				<span className="text-muted-foreground text-sm">
					Game {currentIndex + 1} of {totalGames}
				</span>
				<div className="flex gap-2">
					<Button
						disabled={!previousGame}
						onClick={handlePrevious}
						variant="outline"
					>
						Previous
					</Button>
					<Button disabled={!nextGame} onClick={handleNext} variant="outline">
						Next
					</Button>
				</div>
			</div>
			<div className="mt-8">
				<GameRenderer game={currentGame} onComplete={handleComplete} />
			</div>
		</div>
	)
}
