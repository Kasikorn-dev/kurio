"use client"

import { Eye, File, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"

type FileCardProps = {
	type: "text" | "file" | "image"
	content?: string
	fileUrl?: string
	fileType?: string
	fileName?: string
	onRemove: () => void
}

export function FileCard({
	type,
	content,
	fileUrl,
	fileType,
	fileName,
	onRemove,
}: FileCardProps) {
	const [isPreviewOpen, setIsPreviewOpen] = useState(false)

	if (type === "text") {
		return (
			<div className="group relative flex items-center gap-2 rounded-lg border bg-card p-3">
				<div className="flex-1 overflow-hidden">
					<p className="line-clamp-2 text-muted-foreground text-sm">
						{content}
					</p>
				</div>
				<Button
					className="size-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
					onClick={onRemove}
					size="icon"
					type="button"
					variant="ghost"
				>
					<X className="size-4" />
				</Button>
			</div>
		)
	}

	if (type === "image" && fileUrl) {
		return (
			<div className="group relative overflow-hidden rounded-lg border bg-card">
				{/* Image Preview */}
				<div className="relative aspect-square w-full">
					<Image
						alt={fileName || "Preview"}
						className="object-cover"
						fill
						src={fileUrl}
					/>
					{/* Overlay with actions */}
					<div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/40">
						<div className="flex h-full items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
							<Dialog onOpenChange={setIsPreviewOpen} open={isPreviewOpen}>
								<DialogTrigger asChild>
									<Button
										className="size-8"
										size="icon"
										type="button"
										variant="secondary"
									>
										<Eye className="size-4" />
									</Button>
								</DialogTrigger>
								<DialogContent className="max-h-[60vh] w-[60vw] max-w-[60vw] sm:max-w-[60vw]">
									<DialogHeader>
										<DialogTitle>{fileName || "Image Preview"}</DialogTitle>
									</DialogHeader>
									<div className="relative h-[50vh] w-full">
										<Image
											alt={fileName || "Preview"}
											className="object-contain"
											fill
											src={fileUrl}
										/>
									</div>
								</DialogContent>
							</Dialog>
							<Button
								className="size-8"
								onClick={onRemove}
								size="icon"
								type="button"
								variant="destructive"
							>
								<X className="size-4" />
							</Button>
						</div>
					</div>
				</div>
				{/* File name */}
				{fileName && (
					<div className="border-t bg-card px-2 py-1.5">
						<p className="truncate text-muted-foreground text-xs">{fileName}</p>
					</div>
				)}
			</div>
		)
	}

	// File type
	return (
		<div className="group relative overflow-hidden rounded-lg border bg-card">
			{/* File Preview */}
			<div className="relative aspect-square w-full">
				<div className="flex h-full items-center justify-center bg-muted">
					<File className="size-8 text-muted-foreground" />
				</div>
				{/* Overlay with actions */}
				<div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/40">
					<div className="flex h-full items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
						{fileUrl && (
							<Dialog onOpenChange={setIsPreviewOpen} open={isPreviewOpen}>
								<DialogTrigger asChild>
									<Button
										className="size-8"
										size="icon"
										type="button"
										variant="secondary"
									>
										<Eye className="size-4" />
									</Button>
								</DialogTrigger>
								<DialogContent className="max-h-[60vh] w-[60vw] max-w-[60vw] sm:max-w-[60vw]">
									<DialogHeader>
										<DialogTitle>{fileName || "File Preview"}</DialogTitle>
									</DialogHeader>
									<div className="flex h-[50vh] items-center justify-center">
										{fileType?.startsWith("image/") ? (
											<div className="relative h-full w-full">
												<Image
													alt={fileName || "Preview"}
													className="object-contain"
													fill
													src={fileUrl}
												/>
											</div>
										) : (
											<iframe
												className="h-full w-full rounded-lg border"
												src={fileUrl}
												title={fileName || "File Preview"}
											/>
										)}
									</div>
								</DialogContent>
							</Dialog>
						)}
						<Button
							className="size-8"
							onClick={onRemove}
							size="icon"
							type="button"
							variant="destructive"
						>
							<X className="size-4" />
						</Button>
					</div>
				</div>
			</div>
			{/* File name */}
			{fileName && (
				<div className="border-t bg-card px-2 py-1.5">
					<p className="truncate text-muted-foreground text-xs">{fileName}</p>
					{fileType && (
						<Badge className="text-xs" variant="secondary">
							{fileType}
						</Badge>
					)}
				</div>
			)}
		</div>
	)
}
