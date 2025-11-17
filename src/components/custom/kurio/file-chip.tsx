"use client"

import { File, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

type FileChipProps = {
	resourceType: "text" | "file" | "image"
	resourceContent?: string
	resourceFileUrl?: string
	resourceFileType?: string
	fileName?: string
	onRemove: () => void
}

export function FileChip({
	resourceType,
	resourceContent,
	resourceFileUrl,
	resourceFileType,
	fileName,
	onRemove,
}: FileChipProps) {
	if (resourceType === "text") {
		return (
			<div className="group flex items-center gap-2 rounded-full border bg-muted px-3 py-1.5 text-sm">
				<span className="line-clamp-1 max-w-[200px] text-muted-foreground">
					{resourceContent}
				</span>
				{fileName && <span className="sr-only">{fileName}</span>}
				<Button
					className="size-5 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
					onClick={onRemove}
					size="icon"
					type="button"
					variant="ghost"
				>
					<X className="size-3" />
				</Button>
			</div>
		)
	}

	if (resourceType === "image" && resourceFileUrl) {
		return (
			<div className="group relative flex items-center gap-2 overflow-hidden rounded-full border bg-muted">
				<div className="relative size-8">
					<Image
						alt={fileName || "Preview"}
						className="object-cover"
						fill
						src={resourceFileUrl}
					/>
				</div>
				<span className="pr-2 text-muted-foreground text-xs">
					{fileName || "Image"}
				</span>
				<Button
					className="absolute right-0 size-5 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
					onClick={onRemove}
					size="icon"
					type="button"
					variant="ghost"
				>
					<X className="size-3" />
				</Button>
			</div>
		)
	}

	// File type
	return (
		<div className="group flex items-center gap-2 rounded-full border bg-muted px-3 py-1.5">
			<File className="size-4 text-muted-foreground" />
			<span className="max-w-[150px] truncate text-muted-foreground text-xs">
				{fileName || resourceFileUrl?.split("/").pop() || "File"}
			</span>
			<Button
				className="size-5 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
				onClick={onRemove}
				size="icon"
				type="button"
				variant="ghost"
			>
				<X className="size-3" />
			</Button>
		</div>
	)
}
