"use client"

import { AlertCircle } from "lucide-react"
import { useEffect, useMemo } from "react"
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
import { api } from "@/trpc/react"
import type { Kurio } from "./types"

type KurioDetailClientProps = {
	kurio: Kurio
}

export function KurioDetailClient({
	kurio: initialKurio,
}: KurioDetailClientProps) {
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

	const handleUnitClick = (unitId: string) => {
		// Navigate to unit detail page
		window.location.href = `/kurio/${currentKurio.id}/unit/${unitId}`
	}

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

			{(currentKurio.status === "ready" ||
				currentKurio.status === "generating") &&
			(currentKurio.units.length > 0 ||
				(currentKurio.unitCount !== null && currentKurio.unitCount > 0)) ? (
				<div>
					<KurioPathViewer
						kurio={kurioWithTotal}
						onUnitClick={handleUnitClick}
					/>
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
