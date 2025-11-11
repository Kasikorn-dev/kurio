import { Skeleton } from "@/components/ui/skeleton"

export function ProfileSkeleton() {
	return (
		<div className="container mx-auto py-8">
			<Skeleton className="mb-6 h-9 w-32" />
			<div className="space-y-4">
				<div>
					<Skeleton className="mb-1 h-4 w-24" />
					<Skeleton className="h-6 w-48" />
				</div>
				<Skeleton className="h-10 w-24" />
			</div>
		</div>
	)
}
