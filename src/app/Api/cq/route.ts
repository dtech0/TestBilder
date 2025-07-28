

import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/dbconfig/dbconfig"
import FullCQTemplate from "@/Models/cqTemplate"

await connectDB()

const validateCQ = (cq: any) => {
  if (!cq.questions || !Array.isArray(cq.questions) || cq.questions.length === 0) return false

  const mainQ = cq.questions[0]
  const hasMainText = mainQ?.questionText?.trim() !== ""
  const hasMainImage = mainQ?.passageImage?.trim() !== ""

  if (!hasMainText && !hasMainImage) return false
  if (!mainQ.subQuestions || !Array.isArray(mainQ.subQuestions)) return false
  if (mainQ.subQuestions.length !== cq.containedQuestion) return false

  return mainQ.subQuestions.every((sq: any) =>
    (sq.questionText?.trim() !== "") || (sq.image?.trim() !== "")
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user, primaryInfo, cqs, templateId, operation } = body

    if (!user || !primaryInfo || !Array.isArray(cqs)) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const validatedCQs = cqs.map((cq: any) => ({
      ...cq,
      isComplete: validateCQ(cq)
    }))
    const allCQsComplete = validatedCQs.every(cq => cq.isComplete)

    if (operation === "update" && templateId) {
      const updated = await FullCQTemplate.findByIdAndUpdate(
        templateId,
        {
          user,
          primaryInfo,
          cqs: validatedCQs,
          isComplete: allCQsComplete,
        },
        { new: true }
      )
      if (!updated) {
        return NextResponse.json({ success: false, message: "Template not found" }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: updated }, { status: 200 })
    }

    const newTemplate = new FullCQTemplate({
      user,
      primaryInfo,
      cqs: validatedCQs,
      isComplete: allCQsComplete,
    })
    const saved = await newTemplate.save()

    return NextResponse.json({ success: true, data: saved }, { status: 201 })
  } catch (err) {
    console.error("POST error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get("templateId")

    if (!templateId) {
      return NextResponse.json({ success: false, message: "Missing templateId" }, { status: 400 })
    }

    const template = await FullCQTemplate.findById(templateId)

    if (!template) {
      return NextResponse.json({ success: false, message: "Template not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: template }, { status: 200 })
  } catch (err) {
    console.error("GET error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get("templateId")
    const cqIndex = searchParams.get("cqIndex")

    if (!templateId || cqIndex === null) {
      return NextResponse.json({ success: false, message: "Missing templateId or cqIndex" }, { status: 400 })
    }

    const template = await FullCQTemplate.findById(templateId)
    if (!template) {
      return NextResponse.json({ success: false, message: "Template not found" }, { status: 404 })
    }

    const updatedCQs = [...template.cqs]
    updatedCQs.splice(parseInt(cqIndex), 1)

    const validatedCQs = updatedCQs.map((cq: any) => ({
      ...cq,
      isComplete: validateCQ(cq),
    }))
    const allComplete = validatedCQs.every(cq => cq.isComplete)

    template.cqs = validatedCQs
    template.isComplete = allComplete

    await template.save()

    return NextResponse.json({ success: true, data: template }, { status: 200 })
  } catch (err) {
    console.error("DELETE error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}