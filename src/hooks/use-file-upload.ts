import { useState } from "react"
import { toast } from "sonner"

type UseFileUploadReturn = {
	uploadFile: (file: File) => Promise<{ url: string; path: string } | null>
	isUploading: boolean
}

export function useFileUpload(): UseFileUploadReturn {
	const [isUploading, setIsUploading] = useState(false)

	const uploadFile = async (
		file: File,
	): Promise<{ url: string; path: string } | null> => {
		setIsUploading(true)
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
		} finally {
			setIsUploading(false)
		}
	}

	return { uploadFile, isUploading }
}
