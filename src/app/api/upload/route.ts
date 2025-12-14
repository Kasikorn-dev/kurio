import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
	try {
		// 1. Authenticate user
		const supabase = await createServerSupabaseClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		// 2. Get file from request
		const formData = await request.formData()
		const file = formData.get("file") as File

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 })
		}

		// 3. Generate unique file path
		const fileExt = file.name.split(".").pop()
		const filePath = `${user.id}/${Date.now()}.${fileExt}`

		// 4. Upload file to storage (using admin client for full permissions)
		const adminClient = createSupabaseAdminClient()
		const { error: uploadError } = await adminClient.storage
			.from("kurio-resources")
			.upload(filePath, file)

		if (uploadError) {
			return NextResponse.json(
				{ error: `Upload failed: ${uploadError.message}` },
				{ status: 500 },
			)
		}

		// 5. Create signed URL (expires in 2 hours)
		// This allows AI to access files even if bucket is private
		const { data: signedUrlData, error: signedUrlError } =
			await adminClient.storage
				.from("kurio-resources")
				.createSignedUrl(filePath, 7200)

		if (signedUrlError || !signedUrlData?.signedUrl) {
			return NextResponse.json(
				{ error: `Failed to create signed URL: ${signedUrlError?.message}` },
				{ status: 500 },
			)
		}

		// 6. Return signed URL
		return NextResponse.json({
			url: signedUrlData.signedUrl,
			path: filePath,
			type: file.type,
		})
	} catch (error) {
		console.error("Upload error:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		)
	}
}
