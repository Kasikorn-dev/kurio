import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
	try {
		const supabase = await createServerSupabaseClient()
		const {
			data: { user },
		} = await supabase.auth.getUser()

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const formData = await request.formData()
		const file = formData.get("file") as File

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 })
		}

		const fileExt = file.name.split(".").pop()
		const fileName = `${user.id}/${Date.now()}.${fileExt}`
		const filePath = fileName // ไม่ต้องใส่ bucket name เพราะ .from() จะจัดการให้

		const { error: uploadError } = await supabase.storage
			.from("kurio-resources")
			.upload(filePath, file)

		if (uploadError) {
			return NextResponse.json({ error: uploadError.message }, { status: 500 })
		}

		// ใช้ Admin Client เพื่อสร้าง signed URL ที่มี expiration time นาน (2 ชั่วโมง)
		// เพื่อให้ AI สามารถเข้าถึงได้แม้ bucket เป็น private
		const adminClient = createSupabaseAdminClient()
		const { data: signedUrlData, error: signedUrlError } =
			await adminClient.storage
				.from("kurio-resources")
				.createSignedUrl(filePath, 7200) // 2 hours expiration

		if (signedUrlError || !signedUrlData?.signedUrl) {
			// Fallback to public URL if signed URL fails (for public buckets)
			const {
				data: { publicUrl },
			} = supabase.storage.from("kurio-resources").getPublicUrl(filePath)

			return NextResponse.json({
				url: publicUrl,
				path: filePath,
				type: file.type,
			})
		}

		return NextResponse.json({
			url: signedUrlData.signedUrl,
			path: filePath,
			type: file.type,
		})
	} catch (_error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		)
	}
}
