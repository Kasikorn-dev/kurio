"use client"

import Link from "next/link"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function KurioCard({ kurio }: { kurio: { id: string; title: string; description: string | null; difficultyLevel: string; status: string } }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{kurio.title}</CardTitle>
				<CardDescription>{kurio.description}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between">
					<div className="flex gap-2">
						<Badge>{kurio.difficultyLevel}</Badge>
						<Badge variant="outline">{kurio.status}</Badge>
					</div>
					<Link href={`/kurios/${kurio.id}`}>
						<Button variant="outline">View</Button>
					</Link>
				</div>
			</CardContent>
		</Card>
	)
}

