"use client"

import { BookOpen } from "lucide-react"
import Link from "next/link"
import type { ReactElement } from "react"
import { Button } from "@/components/ui/button"
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty"

export function KurioListEmptyState(): ReactElement {
	return (
		<div>
			<Empty className="py-12">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<BookOpen className="size-8" />
					</EmptyMedia>
					<EmptyTitle>No kurios yet</EmptyTitle>
					<EmptyDescription>
						Create your first Kurio to start your learning journey
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Link href="/create-kurio">
						<Button className="sm:size-default" size="sm">
							Create your first Kurio
						</Button>
					</Link>
				</EmptyContent>
			</Empty>
		</div>
	)
}
