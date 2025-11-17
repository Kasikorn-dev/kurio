"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { useKurioStore } from "@/stores/kurio-store"
import { api } from "@/trpc/react"
import { KurioInput } from "./kurio-input"

export function KurioCreateForm() {
	const router = useRouter()
	const { resources, autoGenEnabled, autoGenThreshold, unitCount, reset } =
		useKurioStore()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isUploading, setIsUploading] = useState(false)
	const [textContent, setTextContent] = useState("")

	const createKurio = api.kurio.create.useMutation({
		onError: (error) => {
			toast.error(error.message)
			setIsSubmitting(false)
			setIsUploading(false)
		},
		onSuccess: () => {
			reset()
			setTextContent("")
			toast.success("Kurio created successfully")
			router.push("/kurio")
		},
	})

	const uploadFile = async (
		file: File,
	): Promise<{ url: string; path: string } | null> => {
		try {
			const formData = new FormData()
			formData.append("file", file)

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || "Failed to upload file")
			}

			const data = await response.json()
			return { url: data.url, path: data.path }
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to upload file",
			)
			return null
		}
	}

	const handleSubmit = async () => {
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
			toast.error("Please select number of units in Advanced Settings")
			return
		}

		setIsSubmitting(true)
		setIsUploading(true)

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

			setIsUploading(false)

			// Extract title from first text resource or first file name or use default
			const firstTextResource = uploadedResources.find(
				(r) => r.resourceType === "text",
			)
			const firstFile = uploadedResources.find(
				(r) => r.resourceType === "file" || r.resourceType === "image",
			)
			const title =
				firstTextResource?.resourceContent?.slice(0, 100) ||
				firstFile?.resourceFileUrl?.split("/").pop()?.slice(0, 100) ||
				"New Kurio"

			// Extract description from text resources
			const textResources = uploadedResources
				.filter((r) => r.resourceType === "text")
				.map((r) => r.resourceContent)
				.join("\n\n")
			const description = textResources.slice(0, 500) || undefined

			await createKurio.mutateAsync({
				title,
				description,
				autoGenEnabled,
				autoGenThreshold,
				unitCount: autoGenEnabled ? undefined : unitCount,
				resources: uploadedResources,
			})
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to upload files. Please try again.",
			)
			setIsSubmitting(false)
			setIsUploading(false)
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
			{isUploading && (
				<div className="text-center text-muted-foreground text-sm">
					Uploading files...
				</div>
			)}
		</div>
	)
}
