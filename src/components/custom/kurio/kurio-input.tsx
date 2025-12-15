"use client"

import { ArrowUp, Plus } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useKurioStore } from "@/stores/kurio-store"
import { FileCard } from "./file-card"
import { KurioAutoGenControls } from "./kurio-auto-gen-controls"

type KurioInputProps = {
	onSubmit: () => void
	isSubmitting?: boolean
	isFileUploading?: boolean
	textValue?: string
	onTextChange?: (value: string) => void
}

export function KurioInput({
	onSubmit,
	isSubmitting = false,
	isFileUploading = false,
	textValue = "",
	onTextChange,
}: KurioInputProps) {
	const { resources, addResource, removeResource } = useKurioStore()
	const [textInput, setTextInput] = useState(textValue)
	const [isDragging, setIsDragging] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const previewUrlsRef = useRef<Map<number, string>>(new Map())

	// Sync with parent if controlled
	const currentText = onTextChange ? textValue : textInput
	const handleTextChange = onTextChange || setTextInput

	const handleFileSelect = useCallback(
		(files: File[]) => {
			let currentIndex = resources.length
			files.forEach((file) => {
				// Create preview URL for images
				const previewUrl = file.type.startsWith("image/")
					? URL.createObjectURL(file)
					: undefined

				const resourceIndex = currentIndex
				if (previewUrl) {
					previewUrlsRef.current.set(resourceIndex, previewUrl)
				}

				addResource({
					type: file.type.startsWith("image/") ? "image" : "file",
					file: file, // Store File object
					fileUrl: previewUrl, // Use preview URL for display
					fileType: file.type,
					previewUrl, // Store preview URL for cleanup
					orderIndex: resourceIndex,
				})
				currentIndex++
			})
		},
		[addResource, resources.length],
	)

	// Cleanup preview URLs when resources are removed
	const handleRemoveResource = useCallback(
		(index: number) => {
			// Cleanup preview URL for the removed resource
			const resource = resources[index]
			if (resource?.previewUrl) {
				URL.revokeObjectURL(resource.previewUrl)
			}
			removeResource(index)
		},
		[removeResource, resources],
	)

	// Cleanup all preview URLs on unmount
	useEffect(() => {
		return () => {
			previewUrlsRef.current.forEach((url) => {
				URL.revokeObjectURL(url)
			})
			previewUrlsRef.current.clear()
		}
	}, [])

	const handleFileInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(e.target.files || [])
			if (files.length > 0) {
				handleFileSelect(files)
			}
			// Reset input
			if (e.target) {
				e.target.value = ""
			}
		},
		[handleFileSelect],
	)

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(true)
	}, [])

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(false)
	}, [])

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault()
			setIsDragging(false)

			const files = Array.from(e.dataTransfer.files || [])
			if (files.length > 0) {
				handleFileSelect(files)
			}
		},
		[handleFileSelect],
	)

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault()
				if (currentText.trim() || resources.length > 0) {
					onSubmit()
				}
			}
		},
		[currentText, resources.length, onSubmit],
	)

	const handleSubmit = useCallback(() => {
		if (currentText.trim() || resources.length > 0) {
			onSubmit()
		}
	}, [currentText, resources.length, onSubmit])

	// Auto-resize textarea
	const handleTextareaChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			const value = e.target.value
			handleTextChange(value)
			// Auto-resize
			const textarea = e.target
			textarea.style.height = "auto"
			textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`
		},
		[handleTextChange],
	)

	const fileResources = resources.filter(
		(r) => r.type === "file" || r.type === "image",
	)

	return (
		<div className="flex w-full flex-col gap-3">
			{/* File Cards - Above input */}
			{fileResources.length > 0 && (
				<div className="max-h-[400px] overflow-y-auto">
					<div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
						{fileResources.map((resource) => {
							const resourceIndex = resources.indexOf(resource)
							return (
								<FileCard
									content={resource.content}
									fileName={resource.file?.name}
									fileType={resource.fileType}
									fileUrl={resource.fileUrl}
									key={`${resource.type}-${resourceIndex}-${resource.fileUrl || resource.content || resource.file?.name}`}
									onRemove={() => handleRemoveResource(resourceIndex)}
									type={resource.type}
								/>
							)
						})}
					</div>
				</div>
			)}

			{/* Main Input Area */}
			<section
				aria-label="Content input area"
				className={cn(
					"relative flex w-full flex-col rounded-xl bg-card transition-all",
					"border border-border shadow-sm dark:border-0 dark:shadow-none",
					isDragging && "bg-primary/5",
					isSubmitting && "opacity-50",
				)}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				{/* Text Input */}
				<Textarea
					className="max-h-[300px] min-h-[60px] flex-1 resize-none border-0 bg-transparent px-4 pt-4 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 md:text-base dark:bg-input/0"
					disabled={isSubmitting}
					onChange={handleTextareaChange}
					onKeyDown={handleKeyDown}
					placeholder="Ask anything"
					ref={textareaRef}
					value={currentText}
				/>

				{/* Bottom Buttons Row */}
				<div className="flex items-center justify-between px-4 py-2">
					{/* Left side buttons */}
					<div className="flex items-center gap-2">
						<div className="flex items-center gap-1">
							{/* File Upload Button */}
							<Button
								className="size-8 shrink-0"
								disabled={isSubmitting}
								onClick={() => fileInputRef.current?.click()}
								size="icon"
								type="button"
								variant="ghost"
							>
								<Plus className="size-4" />
							</Button>
							<input
								accept="image/*,.pdf,.doc,.docx,.txt"
								className="hidden"
								disabled={isSubmitting}
								multiple
								onChange={handleFileInputChange}
								ref={fileInputRef}
								type="file"
							/>
						</div>

						<KurioAutoGenControls />
					</div>

					{/* Right side - Send Button */}
					<Button
						className={cn(
							"size-8 shrink-0",
							((!currentText.trim() && resources.length === 0) ||
								isSubmitting) &&
								"bg-muted/50 text-muted-foreground",
							!(
								(!currentText.trim() && resources.length === 0) ||
								isSubmitting
							) &&
								"bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90",
						)}
						disabled={
							(!currentText.trim() && resources.length === 0) || isSubmitting
						}
						onClick={handleSubmit}
						size="icon"
						type="button"
						variant="ghost"
					>
						{isSubmitting ? (
							<Spinner className="size-4" />
						) : (
							<ArrowUp className="size-4" />
						)}
					</Button>
				</div>
			</section>
			{isFileUploading && (
				<div className="text-center text-muted-foreground text-sm">
					Uploading files...
				</div>
			)}
			{isSubmitting && (
				<div className="text-center text-muted-foreground text-sm">
					Generating games and content...
				</div>
			)}
		</div>
	)
}
