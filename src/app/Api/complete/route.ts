import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/dbconfig/dbconfig"
import PrimaryQuestionInfo from "@/Models/primaryQuestion"
import FullCQTemplate from "@/Models/cqTemplate"
import MCQTemplate from "@/Models/mcqTemplate"
import ShortQuestion from "@/Models/sqTemplete"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    const primaryInfos = await PrimaryQuestionInfo.find({ user: userId }).select("_id examType")

    if (primaryInfos.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          message: "No templates found for this user",
        },
        { status: 200 },
      )
    }

    const primaryInfoIds = primaryInfos.map((info) => info._id)

    const [cqTemplates, mcqTemplates, sqTemplates] = await Promise.all([
      FullCQTemplate.find({
        primaryInfo: { $in: primaryInfoIds },
      })
        .populate("primaryInfo")
        .sort({ updatedAt: -1 }),

      MCQTemplate.find({
        primaryInfo: { $in: primaryInfoIds },
      })
        .populate("primaryInfo")
        .sort({ updatedAt: -1 }),

      ShortQuestion.find({
        primaryInfo: { $in: primaryInfoIds },
      })
        .populate("primaryInfo")
        .sort({ updatedAt: -1 }),
    ])

    const allTemplates = [
      ...cqTemplates.map((template) => ({
        _id: template._id,
        examType: "cq" as const,
        isComplete: template.isComplete,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        primaryInfo: {
          _id: template.primaryInfo._id,
          institutionName: template.primaryInfo.institutionName,
          subject: template.primaryInfo.subject,
          examName: template.primaryInfo.examName,
          class: template.primaryInfo.class,
          totalMark: template.primaryInfo.totalMark,
          examType: template.primaryInfo.examType,
        },
        questionsCount: template.cqs?.length || 0,
      })),

      ...mcqTemplates.map((template) => ({
        _id: template._id,
        examType: "mcq" as const,
        isComplete: template.isComplete,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        primaryInfo: {
          _id: template.primaryInfo._id,
          institutionName: template.primaryInfo.institutionName,
          subject: template.primaryInfo.subject,
          examName: template.primaryInfo.examName,
          class: template.primaryInfo.class,
          totalMark: template.primaryInfo.totalMark,
          examType: template.primaryInfo.examType,
        },
        questionsCount: template.mcqs?.length || 0,
      })),

      ...sqTemplates.map((template) => ({
        _id: template._id,
        examType: "sq" as const,
        isComplete: template.isComplete,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        sqGroup: {
          isComplete: template.sqGroup?.isComplete ?? false,
        },
        primaryInfo: {
          _id: template.primaryInfo._id,
          institutionName: template.primaryInfo.institutionName,
          subject: template.primaryInfo.subject,
          examName: template.primaryInfo.examName,
          class: template.primaryInfo.class,
          totalMark: template.primaryInfo.totalMark,
          examType: template.primaryInfo.examType,
        },
        questionsCount: template.sqGroup?.questions?.length || 0,
      })),
    ]
    allTemplates.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    console.log(`Fetched ${allTemplates.length} templates for user ${userId}`)

    return NextResponse.json(
      {
        success: true,
        data: allTemplates,
        message: `Found ${allTemplates.length} templates`,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error(" Error fetching complete templates:", error)
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { templateId, userId, examType } = body

    if (!templateId || !userId || !examType) {
      return NextResponse.json(
        { success: false, message: "Template ID, User ID, and Exam Type are required" },
        { status: 400 },
      )
    }

    let deletedTemplate = null
    let templateType = ""

    switch (examType) {
      case "cq":
        deletedTemplate = await FullCQTemplate.findByIdAndDelete(templateId) 
        templateType = "CQ"
        break

      case "mcq":
        deletedTemplate = await MCQTemplate.findByIdAndDelete(templateId) 
        templateType = "MCQ"
        break

      case "sq":
        deletedTemplate = await ShortQuestion.findByIdAndDelete(templateId) 
        templateType = "SQ"
        break

      default:
        return NextResponse.json({ success: false, message: "Invalid exam type" }, { status: 400 })
    }

    if (!deletedTemplate) {
      return NextResponse.json({ success: false, message: "Template not found or access denied" }, { status: 404 })
    }

    console.log(`Hard-deleted ${templateType} template: ${templateId}`)

    return NextResponse.json(
      {
        success: true,
        message: `${templateType} template deleted successfully`,
        data: { templateId, templateType },
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error(" Error deleting template:", error)
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 },
    )
  }
}
