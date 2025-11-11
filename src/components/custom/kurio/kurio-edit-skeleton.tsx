import { Skeleton } from "@/components/ui/skeleton"

export function KurioEditSkeleton() {
	return (
		<div className="container mx-auto py-8">
			<Skeleton className="mb-6 h-9 w-48" />
			<form className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-10 w-full" />
				</div>
				<div className="flex flex-col gap-2">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-24 w-full" />
				</div>
				<Skeleton className="h-10 w-32" />
			</form>
		</div>
	)
}
