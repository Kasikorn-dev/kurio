import { Skeleton } from "@/components/ui/skeleton"

export function GamePlayerSkeleton() {
	return (
		<div className="container mx-auto py-8">
			<Skeleton className="mb-6 h-9 w-64" />
			<div className="mb-8 space-y-2">
				<div className="flex items-center justify-between">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 w-32" />
				</div>
				<Skeleton className="h-2 w-full" />
			</div>
			<div className="rounded-lg border p-6">
				<Skeleton className="mb-4 h-6 w-48" />
				<div className="space-y-3">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
					<div className="space-y-2 pt-4">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>
			</div>
		</div>
	)
}
