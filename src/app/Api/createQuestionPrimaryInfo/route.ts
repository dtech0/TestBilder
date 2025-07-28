


import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/dbconfig/dbconfig"
import PrimaryQuestionInfo from "@/Models/primaryQuestion"

await connectDB()

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const {
      user,
      version,
      institutionName,
      class: className,
      totalMark,
      examName,
      subject,
      paper = "",
      subjectCode,
      examType,
      totalTime,
      totalSet = 1,
      examDate,
    } = body

    const newQuestion = await PrimaryQuestionInfo.create({
      user,
      version,
      institutionName,
      class: className,
      totalMark,
      examName,
      subject,
      paper,
      subjectCode,
      examType,
      totalTime,
      totalSet,
      examDate,
    })

    return NextResponse.json({ success: true, data: newQuestion }, { status: 201 })
  } catch (error: any) {
    console.error("POST primary info error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const primaryId = searchParams.get("primaryId")

    if (!primaryId) {
      return NextResponse.json({ success: false, message: "Missing primaryId" }, { status: 400 })
    }

    const primaryInfo = await PrimaryQuestionInfo.findById(primaryId)

    if (!primaryInfo) {
      return NextResponse.json({ success: false, message: "Primary info not found" }, { status: 404 })
    }

    console.log("Primary info fetched:", {
      id: primaryInfo._id,
      institutionName: primaryInfo.institutionName,
      examName: primaryInfo.examName,
    })

    return NextResponse.json({ success: true, data: primaryInfo }, { status: 200 })
  } catch (err) {
    console.error("GET primary info error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

