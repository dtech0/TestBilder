

"use client"

import type React from "react"
import { useState } from "react"
import { Label } from "../../ui/label" 
import { Input } from "../../ui/input" 
import { cn } from "@/lib/utils" 
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/Menu"

const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
)

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return <div className={cn("flex w-full flex-col space-y-2", className)}>{children}</div>
}

export default function SignupFormDemo() {
  const router = useRouter()
  const { login } = useAuth() 
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg("")
    const form = e.currentTarget
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value

    if (!email || !password) {
      setErrorMsg("Email and password are required")
      return
    }

    try {
      const res = await fetch("/Api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.message || "Login failed")
        return
      }

      login(data.user.id) 

      
      window.location.reload()
 window.location.href = "/";
      
    } catch (error) {
      setErrorMsg("Something went wrong. Please try again.")
      console.error("Login error:", error)
    }
  }

  return (
    <div className="shadow-input my-16 mx-auto max-w-md rounded-none bg-gray-100 p-4 md:rounded-2xl md:p-8 dark:bg-black">
      <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Welcome to TestBilder</h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">Log in to unlock premium features</p>
      <form className="my-8" onSubmit={handleSubmit}>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" placeholder="Your Email" type="email" />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" placeholder="••••••••" type="password" />
        </LabelInputContainer>
        {errorMsg && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{errorMsg}</p>}
        <div className="flex justify-between text-blue-700 h-9">
          <Link href="/signup">Sign Up</Link>
          <Link href="/">Forget Password</Link>
        </div>
        <button
          className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
          type="submit"
        >
          Log In &rarr;
          <BottomGradient />
        </button>
      </form>
    </div>
  )
}
