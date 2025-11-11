import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function KurioCardSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-3/4" />
				<Skeleton className="mt-2 h-4 w-full" />
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between">
					<div className="flex gap-2">
						<Skeleton className="h-5 w-16" />
						<Skeleton className="h-5 w-20" />
					</div>
					<Skeleton className="h-9 w-16" />
				</div>
			</CardContent>
		</Card>
	)
}
