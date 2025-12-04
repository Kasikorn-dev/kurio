"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useNavigation } from "@/hooks/use-navigation"
import { useUploadKurioResource } from "@/hooks/use-upload-kurio-resource"
import { AI_CONSTANTS, UNIT_CONSTANTS } from "@/lib/constants"
import { useKurioStore } from "@/stores/kurio-store"
import { api } from "@/trpc/react"
import { KurioInput } from "./kurio-input"

export function KurioCreateForm() {
	const { navigate } = useNavigation()
	const { uploadKuiroResource, isUploading } = useUploadKurioResource()
	const { resources, autoGenEnabled, autoGenThreshold, unitCount, reset } =
		useKurioStore()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [textContent, setTextContent] = useState("")

	const createKurio = api.kurio.create.useMutation({
		onError: (error) => {
			toast.error(error.message)
			setIsSubmitting(false)
		},
	})

	const handleSubmit = async (): Promise<void> => {
		// Combine text content with file resources
		const allResources = [...resources]

		// Add text content as a resource if it exists
		if (textContent.trim()) {
			allResources.push({
				type: "text",
				content: textContent.trim(),
				orderIndex: resources.length,
			})
		}

		if (allResources.length === 0) {
			toast.error("Please add content or files")
			return
		}

		if (!autoGenEnabled && !unitCount) {
			toast.error("Please select number of units")
			return
		}

		setIsSubmitting(true)

		try {
			// Upload all files first
			const uploadedResources = await Promise.all(
				allResources.map(async (resource) => {
					if (
						(resource.type === "file" || resource.type === "image") &&
						resource.file
					) {
						// Upload file to storage
						const uploadResult = await uploadKuiroResource(resource.file)
						return {
							type: resource.type,
							content: resource.content,
							fileUrl: uploadResult.url,
							fileType: resource.fileType,
							orderIndex: resource.orderIndex,
						}
					}
					// Text resource - no upload needed
					return {
						type: resource.type,
						content: resource.content,
						fileUrl: resource.fileUrl,
						fileType: resource.fileType,
						orderIndex: resource.orderIndex,
					}
				}),
			)

			const payload = {
				autoGenEnabled,
				autoGenThreshold,
				unitCount: autoGenEnabled ? UNIT_CONSTANTS.INITIAL_UNITS : unitCount,
				aiModel: AI_CONSTANTS.DEFAULT_MODEL,
				resources: uploadedResources,
			}

			// Start generation and redirect immediately
			const kurio = await createKurio.mutateAsync(payload)

			// Reset form and redirect
			reset()
			setTextContent("")
			setIsSubmitting(false)

			// Show success message and redirect
			toast.success("Creating your Kurio...")
			navigate(`/kurio/${kurio.id}`)
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to upload files. Please try again.",
			)
			setIsSubmitting(false)
		}
	}

	return (
		<div className="flex w-full flex-col gap-4">
			<KurioInput
				isSubmitting={isSubmitting || isUploading}
				onSubmit={handleSubmit}
				onTextChange={setTextContent}
				textValue={textContent}
			/>
			{(isUploading || isSubmitting) && (
				<div className="text-center text-muted-foreground text-sm">
					{isUploading
						? "Uploading files..."
						: "Generating games and content..."}
				</div>
			)}
		</div>
	)
}
