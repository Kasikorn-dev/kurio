import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

type UploadResponse = {
	url: string
	path: string
}

type UseUploadKurioResourceReturn = {
	uploadKuiroResource: (file: File) => Promise<UploadResponse>
	isUploading: boolean
	isError: boolean
	isSuccess: boolean
	error: Error | null
}

async function uploadFileToStorage(file: File): Promise<UploadResponse> {
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

	return data
}

export function useUploadKurioResource(): UseUploadKurioResourceReturn {
	const mutation = useMutation({
		mutationFn: uploadFileToStorage,
		retry: 1, // Retry once on failure
		onSuccess: (data: UploadResponse) => {
			toast.success("File uploaded successfully")
		},
		onError: (error: Error) => {
			toast.error(error.message)
		},
	})

	return {
		uploadKuiroResource: mutation.mutateAsync,
		isUploading: mutation.isPending,
		isError: mutation.isError,
		isSuccess: mutation.isSuccess,
		error: mutation.error,
	}
}
