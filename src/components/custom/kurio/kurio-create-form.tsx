"use client"

import { useState } from "react"
import { toast } from "sonner"
import { AI_CONSTANTS } from "@/lib/constants"
import { useFileUpload } from "@/hooks/use-file-upload"
import { useNavigation } from "@/hooks/use-navigation"
import { useKurioStore } from "@/stores/kurio-store"
import { api } from "@/trpc/react"
import { KurioInput } from "./kurio-input"

export function KurioCreateForm() {
	const { navigate } = useNavigation()
	const { uploadFile, isUploading } = useFileUpload()
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
				resourceType: "text",
				resourceContent: textContent.trim(),
				orderIndex: allResources.length,
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
						(resource.resourceType === "file" ||
							resource.resourceType === "image") &&
						resource.resourceFile
					) {
						// Upload file to storage
						const uploadResult = await uploadFile(resource.resourceFile)
						if (!uploadResult) {
							throw new Error(`Failed to upload ${resource.resourceFile.name}`)
						}
						return {
							resourceType: resource.resourceType,
							resourceContent: resource.resourceContent,
							resourceFileUrl: uploadResult.url,
							resourceFileType: resource.resourceFileType,
							orderIndex: resource.orderIndex,
						}
					}
					// Text resource - no upload needed
					return {
						resourceType: resource.resourceType,
						resourceContent: resource.resourceContent,
						resourceFileUrl: resource.resourceFileUrl,
						resourceFileType: resource.resourceFileType,
						orderIndex: resource.orderIndex,
					}
				}),
			)

			const payload = {
				autoGenEnabled,
				autoGenThreshold,
				unitCount: autoGenEnabled ? undefined : unitCount,
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
