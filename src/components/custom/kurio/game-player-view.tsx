"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { GameRenderer } from "@/components/custom/game/game-renderer"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/trpc/react"

type GamePlayerViewProps = {
	gameId: string
	unitTitle: string
	gameTitle: string
	onBack: () => void
	onNext?: () => void
	onPrevious?: () => void
}

export function GamePlayerView({
	gameId,
	unitTitle,
	gameTitle,
	onBack,
	onNext,
	onPrevious,
}: GamePlayerViewProps) {
	// Fetch full game data
	const { data: game, isLoading } = api.game.getById.useQuery({ id: gameId })

	if (isLoading) {
		return (
			<div className="flex min-h-[400px] items-center justify-center">
				<Spinner className="size-12" />
			</div>
		)
	}

	if (!game) {
		return (
			<div className="text-center">
				<p className="text-muted-foreground">Game not found</p>
				<Button className="mt-4" onClick={onBack}>
					Back to Journey
				</Button>
			</div>
		)
	}

	return (
		<>
			{/* Game Header */}
			<div className="mb-4 flex flex-col items-start gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
				<Button
					className="sm:size-default"
					onClick={onBack}
					size="sm"
					variant="ghost"
				>
					<ArrowLeft className="mr-2 size-4" />
					Back to Journey
				</Button>
				<div className="text-left sm:text-center">
					<p className="text-muted-foreground text-xs sm:text-sm">
						{unitTitle}
					</p>
					<h2 className="font-semibold text-base sm:text-lg">{gameTitle}</h2>
				</div>
				<div className="hidden w-32 sm:block" /> {/* Spacer for desktop */}
			</div>

			{/* Game Player */}
			<GameRenderer game={game} onComplete={() => onNext?.()} />

			{/* Navigation */}
			<div className="mt-4 flex items-center justify-between gap-2 sm:mt-6">
				<Button
					className="sm:size-default"
					disabled={!onPrevious}
					onClick={onPrevious}
					size="sm"
					variant="outline"
				>
					<ArrowLeft className="mr-2 size-4" />
					Previous
				</Button>
				<Button
					className="sm:size-default"
					disabled={!onNext}
					onClick={onNext}
					size="sm"
				>
					Next
					<ArrowRight className="ml-2 size-4" />
				</Button>
			</div>
		</>
	)
}
