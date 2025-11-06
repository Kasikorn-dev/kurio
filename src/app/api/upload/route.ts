import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient()
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
		const filePath = `kurio-resources/${fileName}`

		const { data, error } = await supabase.storage
			.from("kurio-resources")
			.upload(filePath, file)

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		const {
			data: { publicUrl },
		} = supabase.storage.from("kurio-resources").getPublicUrl(filePath)

		return NextResponse.json({
			url: publicUrl,
			path: filePath,
			type: file.type,
		})
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		)
	}
}

