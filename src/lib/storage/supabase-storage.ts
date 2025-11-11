import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function uploadFile(
	file: File,
	path: string,
): Promise<{ url: string; path: string }> {
	const supabase = await createServerSupabaseClient()

	const { data, error } = await supabase.storage
		.from("kurio-resources")
		.upload(path, file)

	if (error) {
		throw new Error(`Failed to upload file: ${error.message}`)
	}

	const {
		data: { publicUrl },
	} = supabase.storage.from("kurio-resources").getPublicUrl(data.path)

	return {
		url: publicUrl,
		path: data.path,
	}
}

export async function deleteFile(path: string): Promise<void> {
	const supabase = await createServerSupabaseClient()

	const { error } = await supabase.storage
		.from("kurio-resources")
		.remove([path])

	if (error) {
		throw new Error(`Failed to delete file: ${error.message}`)
	}
}
