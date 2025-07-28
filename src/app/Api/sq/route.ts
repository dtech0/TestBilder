

import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/dbconfig/dbconfig"
import ShortQuestion from "@/Models/sqTemplete"

const validateSQ = (sq: any) => {
  console.log("Backend validating SQ:", JSON.stringify(sq, null, 2))

  if (!sq.questionText && !sq.image) {
    console.log(" SQ needs either questionText or image")
    return false
  }

  console.log(" Backend SQ validation passed")
  return true
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { user, primaryInfo, sqGroup, isComplete = false, operation, templateId } = body

    console.log(" Received SQ data:", JSON.stringify(body, null, 2))

    if (!user || !primaryInfo) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    if (operation === "update" && templateId) {
      if (!sqGroup || !sqGroup.questions || !Array.isArray(sqGroup.questions)) {
        return NextResponse.json(
          { success: false, message: "SQ Group with questions array is required for update" },
          { status: 400 },
        )
      }

      const validatedQuestions = sqGroup.questions.map((sq: any, index: number) => ({
        ...sq,
        id: sq.id || `${Date.now()}-${index}`,
        parentIdx: index,
        isComplete: validateSQ(sq),
      }))

      const allQuestionsComplete = validatedQuestions.length > 0 && validatedQuestions.every((sq: any) => sq.isComplete)

      const updatedSqGroup = {
        ...sqGroup,
        questions: validatedQuestions,
        isComplete: allQuestionsComplete,
      }

      const updated = await ShortQuestion.findByIdAndUpdate(
        templateId,
        {
          user,
          primaryInfo,
          sqGroup: updatedSqGroup,
          isComplete: allQuestionsComplete,
        },
        { new: true },
      )

      if (!updated) {
        return NextResponse.json({ success: false, message: "Template not found" }, { status: 404 })
      }

      console.log(" SQ Template updated:", updated._id)
      return NextResponse.json({ success: true, data: updated }, { status: 200 })
    }

   
    const existingTemplate = await ShortQuestion.findOne({
      user,
      primaryInfo,
    })

    if (existingTemplate) {
      return NextResponse.json(
        {
          success: false,
          message: "Template already exists for this primary info",
          templateId: existingTemplate._id,
        },
        { status: 409 },
      )
    }

    const newTemplate = new ShortQuestion({
      user,
      primaryInfo,
      sqGroup: {
        title: "sq-1",
        questions: [], 
        isComplete: false,
      },
      isComplete: false, 
    })

    const savedTemplate = await newTemplate.save()
    console.log(" Successfully created SQ Template:", savedTemplate._id)

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: savedTemplate._id, 
          user: savedTemplate.user,
          primaryInfo: savedTemplate.primaryInfo,
          sqGroup: savedTemplate.sqGroup,
          isComplete: savedTemplate.isComplete,
          createdAt: savedTemplate.createdAt,
          updatedAt: savedTemplate.updatedAt,
        },
        message: "SQ Template created successfully. Add questions to complete it.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating SQ template:", error)
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get("templateId")
    const user = searchParams.get("user")
    const primaryInfo = searchParams.get("primaryInfo")
    const userId = searchParams.get("userId")
    const onlyComplete = searchParams.get("onlyComplete")

    if (userId && onlyComplete === "true") {
      const templates = await ShortQuestion.find({
        user: userId,
        isComplete: true,
        isDeleted: { $ne: true },
      })
        .populate("primaryInfo")
        .sort({ updatedAt: -1 })

      return NextResponse.json({ success: true, data: templates }, { status: 200 })
    }

    if (!templateId && (!user || !primaryInfo)) {
      return NextResponse.json({ success: false, message: "Missing templateId or user/primaryInfo" }, { status: 400 })
    }

    let template
    if (templateId) {
      template = await ShortQuestion.findById(templateId).populate("primaryInfo")
    } else {
      template = await ShortQuestion.findOne({ user, primaryInfo }).populate("primaryInfo")
    }

    if (!template) {
      return NextResponse.json({ success: false, message: "Template not found" }, { status: 404 })
    }

    console.log("Successfully fetched SQ Template:", template._id)

    return NextResponse.json(
      {
        success: true,
        data: template,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching SQ template:", error)
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get("templateId")
    const sqIndex = searchParams.get("sqIndex")

    if (!templateId || sqIndex === null) {
      return NextResponse.json({ success: false, message: "Missing templateId or sqIndex" }, { status: 400 })
    }

    const template = await ShortQuestion.findById(templateId)

    if (!template) {
      return NextResponse.json({ success: false, message: "Template not found" }, { status: 404 })
    }

    const updatedQuestions = [...template.sqGroup.questions]
    updatedQuestions.splice(Number.parseInt(sqIndex), 1)

    const validatedQuestions = updatedQuestions.map((sq: any, index: number) => ({
      ...sq,
      parentIdx: index,
      isComplete: validateSQ(sq),
    }))

    const allComplete = validatedQuestions.length > 0 && validatedQuestions.every((sq) => sq.isComplete)

    template.sqGroup.questions = validatedQuestions
    template.sqGroup.isComplete = allComplete
    template.isComplete = allComplete

    await template.save()

    console.log("SQ deleted from template:", template._id)
    return NextResponse.json({ success: true, data: template }, { status: 200 })
  } catch (err) {
    console.error(" SQ DELETE error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
