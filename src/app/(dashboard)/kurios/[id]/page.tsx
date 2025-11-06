"use client"

import { use } from "react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function KurioDetailPage() {
	const params = useParams()
	const kurioId = params.id as string

	const { data: kurio, isLoading } = api.kurio.getById.useQuery(
		{ id: kurioId },
		{ enabled: !!kurioId },
	)

	if (isLoading) {
		return <div>Loading...</div>
	}

	if (!kurio) {
		return <div>Kurio not found</div>
	}

	return (
		<div className="container mx-auto py-8">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">{kurio.title}</h1>
					<p className="text-muted-foreground">{kurio.description}</p>
				</div>
				<Link href={`/kurios/${kurio.id}/edit`}>
					<Button variant="outline">Edit</Button>
				</Link>
			</div>

			<div className="space-y-4">
				<div>
					<h2 className="text-xl font-semibold">Resources</h2>
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
					<h2 className="text-xl font-semibold">Units</h2>
					{kurio.units.length === 0 ? (
						<p className="text-muted-foreground">No units yet</p>
					) : (
						<div className="space-y-2">
							{kurio.units.map((unit) => (
								<div key={unit.id} className="rounded-md border p-4">
									<h3 className="font-semibold">{unit.title}</h3>
									{unit.lessons.length > 0 && (
										<ul className="mt-2 list-disc pl-6">
											{unit.lessons.map((lesson) => (
												<li key={lesson.id}>{lesson.title}</li>
											))}
										</ul>
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

