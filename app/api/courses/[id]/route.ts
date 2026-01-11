import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase.from("courses").delete().eq("id", id)

    if (error) {
      console.error("[API] Error deleting course:", error)
      throw error
    }

    console.log("[API] Successfully deleted course:", id)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[API] Error deleting course:", error)
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
  }
}
