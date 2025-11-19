"use client"

import Link from "next/link"
import { DeleteKurioButton } from "@/components/custom/kurio/delete-kurio-button"
import { GenerateGameButton } from "@/components/custom/kurio/generate-game-button"
import { Button } from "@/components/ui/button"

type KurioDetailClientProps = {
	kurio: {
		id: string
		title: string
		description: string | null
		status: string
		resources: Array<{
			id: string
			resourceType: string
			resourceContent: string | null
			resourceFileUrl: string | null
		}>
		units: Array<{
			id: string
			title: string
			games: Array<unknown>
		}>
	}
}

export function KurioDetailClient({ kurio }: KurioDetailClientProps) {
	return (
		<div className="container mx-auto py-8">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">{kurio.title}</h1>
					<p className="text-muted-foreground">{kurio.description}</p>
				</div>
				<div className="flex gap-2">
					{kurio.status === "ready" && kurio.units.length > 0 && (
						<Link href={`/kurio/${kurio.id}/play`}>
							<Button>Play Game</Button>
						</Link>
					)}
					{kurio.status === "draft" && kurio.resources.length > 0 && (
						<GenerateGameButton kurioId={kurio.id} />
					)}
					<Link href={`/kurio/${kurio.id}/edit`}>
						<Button variant="outline">Edit</Button>
					</Link>
					<DeleteKurioButton kurioId={kurio.id} kurioTitle={kurio.title} />
				</div>
			</div>

			<div className="space-y-4">
				<div>
					<h2 className="font-semibold text-xl">Resources</h2>
					{kurio.resources.length === 0 ? (
						<p className="text-muted-foreground">No resources</p>
					) : (
						<ul className="list-disc pl-6">
							{kurio.resources.map((resource) => (
								<li key={resource.id}>
									{resource.resourceType}:{" "}
									{resource.resourceContent || resource.resourceFileUrl}
								</li>
							))}
						</ul>
					)}
				</div>

				<div>
					<h2 className="font-semibold text-xl">Units</h2>
					{kurio.units.length === 0 ? (
						<p className="text-muted-foreground">No units yet</p>
					) : (
						<div className="space-y-2">
							{kurio.units.map((unit) => (
								<div className="rounded-md border p-4" key={unit.id}>
									<h3 className="font-semibold">{unit.title}</h3>
									{unit.games.length > 0 && (
										<p className="mt-1 text-muted-foreground text-sm">
											{unit.games.length}{" "}
											{unit.games.length === 1 ? "game" : "games"}
										</p>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
