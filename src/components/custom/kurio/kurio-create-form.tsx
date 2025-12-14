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

	// Validate form inputs
	const validateForm = () => {
		const allResources = textContent.trim()
			? [...resources, { type: "text" as const, content: textContent.trim(), orderIndex: resources.length }]
			: resources

		if (allResources.length === 0) {
			throw new Error("Please add content or files")
		}

		if (!autoGenEnabled && !unitCount) {
			throw new Error("Please select number of units")
		}

		return allResources
	}

	// Upload files and prepare resources
	const prepareResources = async (allResources: typeof resources) => {
		return Promise.all(
			allResources.map(async (resource) => {
				// Upload file if needed
				if ((resource.type === "file" || resource.type === "image") && resource.file) {
					const { url ,path } = await uploadKuiroResource(resource.file)
					return { ...resource, fileUrl: url ,filePath:path}
				}
				return resource
			})
		)
	}

	const handleSubmit = async (): Promise<void> => {
		setIsSubmitting(true)

		try {
			const allResources = validateForm()
			const uploadedResources = await prepareResources(allResources)

			const kurio = await createKurio.mutateAsync({
				autoGenEnabled,
				autoGenThreshold,
				unitCount: autoGenEnabled ? UNIT_CONSTANTS.INITIAL_UNITS : unitCount,
				resources: uploadedResources,
			})

			reset()
			setTextContent("")
			toast.success("Creating your Kurio...")
			navigate(`/kurio/${kurio.id}`)
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to create Kurio")
		} finally {
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
