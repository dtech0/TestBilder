




import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/dbconfig/dbconfig"
import MCQTemplate from "@/Models/mcqTemplate"

function validateMCQ(mcq: any): boolean {
  if (mcq.mcqType === "mcq-4") {
    const hasPassageText = mcq.passage && mcq.passage.trim() !== ""
    const hasPassageImage = mcq.passageImage && mcq.passageImage.trim() !== ""
    if (!hasPassageText && !hasPassageImage) return false

    if (!mcq.subQuestions || !Array.isArray(mcq.subQuestions) || mcq.subQuestions.length === 0) return false

    const allSubQuestionsValid = mcq.subQuestions.every((subQ: any) => {
      const hasContent = (subQ.questionText && subQ.questionText.trim()) || (subQ.image && subQ.image.trim())
      if (!hasContent) return false
      if (!Array.isArray(subQ.options) || subQ.options.length < 4) return false
      if (subQ.options.some((opt: string) => !opt || opt.trim() === "")) return false
      const answerIndex = Number.parseInt(subQ.correctAnswer)
      return !isNaN(answerIndex) && answerIndex >= 0 && answerIndex < subQ.options.length
    })
    return allSubQuestionsValid
  } else {
    const hasContent = (mcq.questionText && mcq.questionText.trim()) || (mcq.image && mcq.image.trim())
    if (!hasContent) return false

    const requiredOptions = mcq.mcqType === "mcq-2" ? 2 : 4
    if (!Array.isArray(mcq.options) || mcq.options.length < requiredOptions) return false
    if (mcq.options.slice(0, requiredOptions).some((opt: string) => !opt || opt.trim() === "")) return false

    const answerIndex = Number.parseInt(mcq.correctAnswer)
    if (isNaN(answerIndex) || answerIndex < 0 || answerIndex >= requiredOptions) return false

    if (mcq.mcqType === "mcq-3") {
      if (!Array.isArray(mcq.infoItems) || mcq.infoItems.length < 3) return false
      if (mcq.infoItems.slice(0, 3).some((info: string) => !info || info.trim() === "")) return false
    }
    return true
  }
}

function checkTemplateIsComplete(mcqs: any[]): boolean {
  if (!Array.isArray(mcqs) || mcqs.length === 0) return false
  return mcqs.every(validateMCQ)
}

function convertMCQsToBackendFormat(mcqs: any[][]): any[] {
  const flatMCQs: any[] = []

  mcqs.forEach((group, groupIndex) => {
    group.forEach((mcq) => {
      const base = {
        mcqType: mcq.mcqType,
        parentIdx: groupIndex,
        marks: mcq.marks || 1,
      }

      if (mcq.mcqType === "mcq-4") {
        flatMCQs.push({
          ...base,
          passage: mcq.passage || "",
          passageImage: mcq.passageImage || "",
          subQuestions: (mcq.subQuestions || []).map((subQ: any, index: number) => ({
            childIdx: index,
            questionText: subQ.questionText || "",
            image: subQ.image || "",
            options: subQ.options || [],
            correctAnswer: subQ.correctAnswer || "",
            marks: subQ.marks || 1,
          })),
        })
      } else {
        const cleanedMCQ: any = {
          ...base,
          questionText: mcq.questionText || "",
          image: mcq.image || "",
          options: mcq.options || [],
          correctAnswer: mcq.correctAnswer || "",
        }

        if (mcq.mcqType === "mcq-3" && mcq.infoItems) {
          cleanedMCQ.infoItems = mcq.infoItems
        }

        flatMCQs.push(cleanedMCQ)
      }
    })
  })

  return flatMCQs
}

function convertMCQsToFrontendFormat(mcqs: any[]): any[][] {
  const groupedMCQs: { [key: number]: any[] } = {}

  mcqs.forEach((mcq) => {
    const parentIdx = mcq.parentIdx
    if (!groupedMCQs[parentIdx]) {
      groupedMCQs[parentIdx] = []
    }
    groupedMCQs[parentIdx].push(mcq)
  })

  const result: any[][] = []
  Object.keys(groupedMCQs)
    .sort((a, b) => Number(a) - Number(b))
    .forEach((key) => {
      result.push(groupedMCQs[Number(key)])
    })

  return result
}

async function retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error

      if (error.name === "VersionError" && attempt < maxRetries) {
        console.log(`Version conflict detected, retrying attempt ${attempt + 1}/${maxRetries}`)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100))
        continue
      }

      throw error
    }
  }

  throw lastError
}

export async function POST(req: NextRequest) {
  await connectDB()

  try {
    const body = await req.json()
    const { user, primaryInfo, mcqs, operation = "update" } = body

    if (!user || !primaryInfo || !mcqs) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
        },
        { status: 400 },
      )
    }

    const backendMCQs = convertMCQsToBackendFormat(mcqs)
    const isComplete = checkTemplateIsComplete(backendMCQs)

    const result = await retryOperation(async () => {
      const template = await MCQTemplate.findOneAndUpdate(
        { user, primaryInfo },
        {
          $set: {
            mcqs: backendMCQs,
            isComplete: isComplete,
            updatedAt: new Date(),
          },
        },
        {
          new: true, 
          upsert: true, 
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      )

      return template
    })

    const isNewDocument = !result.createdAt || result.createdAt.getTime() === result.updatedAt.getTime()

    return NextResponse.json(
      {
        success: true,
        message: isNewDocument ? "Template created" : "Template updated",
        data: {
          ...result.toObject(),
          mcqs: convertMCQsToFrontendFormat(result.mcqs),
        },
      },
      { status: isNewDocument ? 201 : 200 },
    )
  } catch (error: any) {
    console.error("POST /api/mcq error:", error)

    if (error.name === "VersionError") {
      return NextResponse.json(
        {
          success: false,
          message: "Document was modified by another process. Please refresh and try again.",
          error: "VERSION_CONFLICT",
        },
        { status: 409 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  await connectDB()

  try {
    const { searchParams } = new URL(req.url)
    const user = searchParams.get("user")
    const primaryInfo = searchParams.get("primaryInfo")
    const templateId = searchParams.get("templateId")

    let template = null

    if (templateId) {
      template = await MCQTemplate.findById(templateId).populate("primaryInfo")
    } else if (user && primaryInfo) {
      template = await MCQTemplate.findOne({ user, primaryInfo }).populate("primaryInfo")
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Missing templateId or user+primaryInfo",
        },
        { status: 400 },
      )
    }

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          message: "Template not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...template.toObject(),
          mcqs: convertMCQsToFrontendFormat(template.mcqs),
        },
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("GET /api/mcq error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function PUT(req: NextRequest) {
  await connectDB()

  try {
    const body = await req.json()
    const { user, primaryInfo, mcqId, updatedMCQ } = body

    if (!user || !primaryInfo || !mcqId || !updatedMCQ) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const result = await retryOperation(async () => {
      const template = await MCQTemplate.findOneAndUpdate(
        {
          user,
          primaryInfo,
          "mcqs._id": mcqId,
        },
        {
          $set: {
            "mcqs.$": { ...updatedMCQ },
            updatedAt: new Date(),
          },
        },
        { new: true },
      )

      if (!template) {
        throw new Error("Template or MCQ not found")
      }

      template.isComplete = checkTemplateIsComplete(template.mcqs)
      return await template.save()
    })

    return NextResponse.json(
      {
        success: true,
        message: "MCQ updated",
        data: {
          ...result.toObject(),
          mcqs: convertMCQsToFrontendFormat(result.mcqs),
        },
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("PUT /api/mcq error:", error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  await connectDB()

  try {
    const body = await req.json()
    const { user, primaryInfo, mcqId, deleteType = "single" } = body

    if (!user || !primaryInfo || !mcqId) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const result = await retryOperation(async () => {
      const template = await MCQTemplate.findOne({ user, primaryInfo })
      if (!template) {
        throw new Error("Template not found")
      }

      if (deleteType === "group") {
        const parentIdx = Number.parseInt(mcqId)
        const initialLength = template.mcqs.length
        template.mcqs = template.mcqs.filter((mcq: any) => mcq.parentIdx !== parentIdx)

        if (template.mcqs.length === initialLength) {
          throw new Error("MCQ group not found")
        }

        const groupMap = new Map()
        template.mcqs.forEach((mcq: any) => {
          if (!groupMap.has(mcq.parentIdx)) {
            groupMap.set(mcq.parentIdx, groupMap.size)
          }
          mcq.parentIdx = groupMap.get(mcq.parentIdx)
        })
      } else {
        const initialLength = template.mcqs.length
        template.mcqs = template.mcqs.filter((mcq: any) => mcq._id.toString() !== mcqId)

        if (template.mcqs.length === initialLength) {
          throw new Error("MCQ not found")
        }
      }

      template.isComplete = checkTemplateIsComplete(template.mcqs)
      template.updatedAt = new Date()
      return await template.save()
    })

    return NextResponse.json(
      {
        success: true,
        message: "MCQ deleted",
        data: {
          ...result.toObject(),
          mcqs: convertMCQsToFrontendFormat(result.mcqs),
        },
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("DELETE /api/mcq error:", error)
    return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 })
  }
}
