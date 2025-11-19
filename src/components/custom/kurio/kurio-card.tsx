"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

type KurioCardProps = {
	kurio: {
		id: string
		title: string
		description: string | null
		status: string
	}
}

export function KurioCard({ kurio }: KurioCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{kurio.title}</CardTitle>
				<CardDescription>{kurio.description}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between">
					<div className="flex gap-2">
						<Badge variant="outline">{kurio.status}</Badge>
					</div>
					<div className="flex gap-2">
						{kurio.status === "ready" && (
							<Link href={`/kurio/${kurio.id}/play`}>
								<Button size="sm" variant="default">
									Play
								</Button>
							</Link>
						)}
						<Link href={`/kurio/${kurio.id}`}>
							<Button size="sm" variant="outline">
								View
							</Button>
						</Link>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
