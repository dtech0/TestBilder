

import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/dbconfig/dbconfig"
import User from "@/Models/userModel"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findById(userId).select("-password") 

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: user._id,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          mobileNo: user.mobileNo || "",
          institutionName: user.institutionName || "",
          version: user.version || "bangla",
        },
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      userId,
      firstName,
      lastName,
      mobileNo,
      institutionName,
      version,
      newPassword,
      currentPassword,
    } = body

    if (!userId || !currentPassword) {
      return NextResponse.json(
        { success: false, message: "User ID and current password are required" },
        { status: 400 },
      )
    }

    await connectDB()

    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    if (user.password !== currentPassword) {
      return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 401 })
    }

    const updateData: any = {}
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (mobileNo !== undefined) updateData.mobileNo = mobileNo
    if (institutionName !== undefined) updateData.institutionName = institutionName
    if (version !== undefined) updateData.version = version

    if (newPassword && newPassword.trim() !== "") {
      if (newPassword.length < 3) {
        return NextResponse.json(
          { success: false, message: "New password must be at least 4 characters" },
          { status: 400 },
        )
      }
      updateData.password = newPassword 
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password")

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        data: {
          _id: updatedUser._id,
          firstName: updatedUser.firstName || "",
          lastName: updatedUser.lastName || "",
          email: updatedUser.email || "",
          mobileNo: updatedUser.mobileNo || "",
          institutionName: updatedUser.institutionName || "",
          version: updatedUser.version || "bangla",
        },
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Profile update error:", error)
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}

