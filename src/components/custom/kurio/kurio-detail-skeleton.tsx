import { Skeleton } from "@/components/ui/skeleton"

export function KurioDetailSkeleton() {
	return (
		<div className="container mx-auto py-8">
			<div className="mb-6 flex items-center justify-between">
				<div className="flex-1">
					<Skeleton className="mb-2 h-9 w-64" />
					<Skeleton className="h-5 w-96" />
				</div>
				<Skeleton className="h-9 w-16" />
			</div>

			<div className="space-y-4">
				<div>
					<Skeleton className="mb-2 h-6 w-32" />
					<div className="space-y-2 pl-6">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-3/4" />
					</div>
				</div>

				<div>
					<Skeleton className="mb-2 h-6 w-24" />
					<div className="space-y-2">
						<div className="rounded-md border p-4">
							<Skeleton className="mb-2 h-5 w-48" />
							<div className="mt-2 space-y-1 pl-6">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-2/3" />
							</div>
						</div>
						<div className="rounded-md border p-4">
							<Skeleton className="mb-2 h-5 w-40" />
							<div className="mt-2 space-y-1 pl-6">
								<Skeleton className="h-4 w-full" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
