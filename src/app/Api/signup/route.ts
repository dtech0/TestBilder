

import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/dbconfig/dbconfig"
import User from "@/Models/userModel"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, mobileNo, email, password } = body

    if (!firstName || lastName || !mobileNo || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 })
    }

    if (password.length < 3) {
      return NextResponse.json({ message: "Password must be at least 4 characters" }, { status: 400 })
    }

    await connectDB()

    const existingUser = await User.findOne({ email }).exec()
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 })
    }

    const user = new User({
      firstName,
      lastName:lastName|| "",
      mobileNo,
      email,
      password,
      institutionName: "", 
      version: "bangla", 
    })

    await user.save()

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        data: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 })
  }
}
