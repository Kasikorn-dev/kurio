"use client"

import { AlertCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo } from "react"
import { GamePlayerView } from "@/components/custom/kurio/game-player-view"
import { KurioPathViewer } from "@/components/custom/kurio/kurio-path-viewer"
import { ManageKurioDialog } from "@/components/custom/kurio/manage-kurio-dialog"
import { Button } from "@/components/ui/button"
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { useKurioNavigation } from "@/hooks/use-kurio-navigation"
import { api } from "@/trpc/react"
import type { Kurio } from "./types"

type KurioDetailClientProps = {
	kurio: Kurio
}

export function KurioDetailClient({
	kurio: initialKurio,
}: KurioDetailClientProps) {
	const searchParams = useSearchParams()

	// Poll for updates if generating or if units are still being generated
	const shouldPoll =
		initialKurio.status === "generating" ||
		(initialKurio.unitCount !== null &&
			initialKurio.units.length < initialKurio.unitCount)

	const { data: kurio } = api.kurio.getById.useQuery(
		{ id: initialKurio.id },
		{
			refetchInterval: shouldPoll ? 2000 : false,
		},
	)

	// Use initialKurio if query hasn't loaded yet
	const currentKurio = kurio ?? initialKurio

	// Update browser title when kurio title changes
	useEffect(() => {
		if (currentKurio.title && currentKurio.title !== "Generating...") {
			document.title = `${currentKurio.title} - Kurio`
		} else {
			document.title = "Kurio"
		}
	}, [currentKurio.title])

	// Calculate totalGames from units and prepare kurio for path viewer (memoized)
	const kurioWithTotal = useMemo(
		() => ({
			...currentKurio,
			totalGames: currentKurio.units.reduce(
				(sum: number, unit: { games: Array<unknown> }) =>
					sum + unit.games.length,
				0,
			),
			unitCount: currentKurio.unitCount,
		}),
		[currentKurio],
	)

	// Read from URL (source of truth)
	const unitId = searchParams.get("unit")
	const gameId = searchParams.get("game")

	// Use navigation hook
	const navigation = useKurioNavigation({
		kurioId: currentKurio.id,
		units: currentKurio.units,
		unitId,
		gameId,
	})

	// Prefetch next/previous games for smooth navigation
	const utils = api.useUtils()
	useEffect(() => {
		if (navigation.currentUnit && navigation.currentGameIndex !== -1) {
			// Prefetch next game
			const nextGame =
				navigation.currentUnit.games[navigation.currentGameIndex + 1]
			if (nextGame) {
				void utils.game.getById.prefetch({ id: nextGame.id })
			} else {
				// Prefetch first game of next unit
				const currentUnitIndex = currentKurio.units.findIndex(
					(u) => u.id === navigation.currentUnit?.id,
				)
				const nextUnit = currentKurio.units[currentUnitIndex + 1]
				const firstGame = nextUnit?.games[0]
				if (firstGame) {
					void utils.game.getById.prefetch({ id: firstGame.id })
				}
			}

			// Prefetch previous game
			const prevGame =
				navigation.currentUnit.games[navigation.currentGameIndex - 1]
			if (prevGame) {
				void utils.game.getById.prefetch({ id: prevGame.id })
			}
		}
	}, [
		navigation.currentUnit,
		navigation.currentGameIndex,
		currentKurio.units,
		utils.game.getById,
	])

	// Determine current view
	const currentView = gameId ? "game" : "journey"

	return (
		<div className="relative min-h-screen">
			<div className="container relative mx-auto px-4">
				<ManageKurioDialog
					kurio={{
						id: currentKurio.id,
						title: currentKurio.title,
						description: currentKurio.description,
						status: currentKurio.status,
						autoGenEnabled: currentKurio.autoGenEnabled,
					}}
				/>
			</div>

			{currentView === "journey" &&
			(currentKurio.status === "ready" ||
				currentKurio.status === "generating") &&
			(currentKurio.units.length > 0 ||
				(currentKurio.unitCount !== null && currentKurio.unitCount > 0)) ? (
				<div>
					<KurioPathViewer
						kurio={kurioWithTotal}
						onUnitClick={navigation.goToUnit}
					/>
				</div>
			) : currentView === "game" &&
				navigation.currentGame &&
				navigation.currentUnit ? (
				<div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
					{(() => {
						const game = navigation.currentUnit.games.find(
							(g) => g.id === navigation.currentGame?.id,
						)
						if (!game || !navigation.currentGame) {
							return null
						}
						return (
							<GamePlayerView
								game={game}
								gameId={navigation.currentGame.id}
								gameTitle={navigation.currentGame.title}
								onBack={navigation.goToJourney}
								onNext={
									navigation.hasNextGame ? navigation.goToNextGame : undefined
								}
								onPrevious={
									navigation.hasPreviousGame
										? navigation.goToPreviousGame
										: undefined
								}
								unitTitle={navigation.currentUnit.title}
							/>
						)
					})()}
				</div>
			) : (
				<div className="container mx-auto py-8 text-center">
					<h1 className="font-bold text-3xl">{currentKurio.title}</h1>
					{currentKurio.description && (
						<p className="mt-2 text-muted-foreground">
							{currentKurio.description}
						</p>
					)}

					{currentKurio.status === "generating" ? (
						<div className="mt-12 flex flex-col items-center gap-4">
							<Spinner className="size-12" />
							<div className="space-y-2">
								<p className="font-medium text-lg">
									Creating your learning journey...
								</p>
								<p className="text-muted-foreground text-sm">
									This may take a few minutes. Feel free to stay on this page.
								</p>
								{currentKurio.unitCount !== null && (
									<p className="text-muted-foreground text-xs">
										Generating {currentKurio.units.length} /{" "}
										{currentKurio.unitCount} units
									</p>
								)}
							</div>
						</div>
					) : currentKurio.status === "error" ? (
						<div>
							<Empty>
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<AlertCircle className="size-8" />
									</EmptyMedia>
									<EmptyTitle>Failed to generate games</EmptyTitle>
									<EmptyDescription>
										Something went wrong while creating your learning journey.
										Please try again.
									</EmptyDescription>
								</EmptyHeader>
								<EmptyContent>
									<Button onClick={() => window.location.reload()}>
										Try Again
									</Button>
								</EmptyContent>
							</Empty>
						</div>
					) : (
						<p className="mt-8 text-muted-foreground">No games available yet</p>
					)}
				</div>
			)}
		</div>
	)
}
