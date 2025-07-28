// "use client"

// import type React from "react" 
// import { createContext, useContext, useState, useEffect, useCallback } from "react" 
// import {
//   Menubar,
//   MenubarContent,
//   MenubarMenu,
//   MenubarRadioGroup,
//   MenubarRadioItem,
//   MenubarTrigger,
// } from "@/components/ui/menubar"
// import { useRouter } from "next/navigation"
// import { CgProfile } from "react-icons/cg"
// import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
// import Link from "next/link"


// interface AuthContextType {
//   userId: string | null
//   isLoggedIn: boolean
//   login: (id: string) => void
//   logout: () => void
//   refreshAuthStatus: () => void
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [userId, setUserId] = useState<string | null>(null)
//   const [isLoggedIn, setIsLoggedIn] = useState(false)

//   const checkAuthStatus = useCallback(() => {
//     if (typeof window !== "undefined") {
//       const storedUserId = localStorage.getItem("userId")
//       setUserId(storedUserId)
//       setIsLoggedIn(!!storedUserId)
//     }
//   }, [])

//   useEffect(() => {
//     checkAuthStatus() 

//     const handleStorageChange = () => {
//       checkAuthStatus()
//     }
//     window.addEventListener("storage", handleStorageChange)

//     return () => {
//       window.removeEventListener("storage", handleStorageChange)
//     }
//   }, [checkAuthStatus])

//   const login = useCallback((id: string) => {
//     if (typeof window !== "undefined") {
//       localStorage.setItem("userId", id)
//       setUserId(id)
//       setIsLoggedIn(true)
//     }
//   }, [])

//   const logout = useCallback(() => {
//     if (typeof window !== "undefined") {
//       localStorage.removeItem("userId")
//       setUserId(null)
//       setIsLoggedIn(false)
//     }
//   }, [])

//   const refreshAuthStatus = useCallback(() => {
//     checkAuthStatus()
//   }, [checkAuthStatus])

//   return (
//     <AuthContext.Provider value={{ userId, isLoggedIn, login, logout, refreshAuthStatus }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export function useAuth() {
//   const context = useContext(AuthContext)
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// }

// function MenubarContentComponent() {
//   const router = useRouter()
//   const { isLoggedIn, logout } = useAuth() 

//   const handleLogout = () => {
//     logout()
//     router.push("/")
//   }

//   return (
//     <Menubar className=" justify-between fixed w-full top-0 z-10">
//       <p className="text-3xl font-extrabold text-black-300 drop-shadow-xl text-shadow-lg">TestBilder</p>
//       <div className="flex gap-4">
//         <MenubarMenu>
//           <MenubarTrigger>
//             <Link href="/">Home</Link>
//           </MenubarTrigger>
//         </MenubarMenu>
//         <MenubarMenu>
//           <MenubarTrigger>My Question</MenubarTrigger>
//           <MenubarContent>
//             <MenubarRadioGroup value="createNew">
//               <Link href="/createQuestionPrimaryInfo">
//                 <MenubarRadioItem value="createNew">Create New</MenubarRadioItem>
//               </Link>
//               <Link href="/incomplete">
//                 <MenubarRadioItem value="incomplete">Incomplete</MenubarRadioItem>
//               </Link>
//               <Link href="/complete">
//                 <MenubarRadioItem value="complete">Complete</MenubarRadioItem>
//               </Link>
//             </MenubarRadioGroup>
//           </MenubarContent>
//         </MenubarMenu>
//         <MenubarMenu>
//           {isLoggedIn ? (
//             <MenubarTrigger onClick={handleLogout}>Logout</MenubarTrigger>
//           ) : (
//             <MenubarTrigger asChild>
//               <Link href="/login">Login</Link>
//             </MenubarTrigger>
//           )}
//         </MenubarMenu>
//       </div>
//       <Sheet>
//         <SheetTrigger>
//           <div className="flex items-center gap-1">
//             <CgProfile /> Profile
//           </div>
//         </SheetTrigger>
//         <SheetContent>
//           <SheetHeader>
//             <SheetTitle>Your Profile</SheetTitle>
//             <SheetDescription>
//               If you edit your profile, it will reflect in your new exam templet. You must save all the info providing
//               current password
//             </SheetDescription>
//           </SheetHeader>
//           <form className="px-4 h-full overflow-y-auto">
//             <div className="py-1">
//               <label htmlFor="userName" className="font-semibold">
//                 Name
//               </label>
//               <input
//                 className="w-full p-2 border border-black"
//                 defaultValue="your name from DB"
//                 id="userName"
//                 type="text"
//               />
//             </div>
//             <div className="py-1">
//               <label htmlFor="institutionName" className="font-semibold">
//                 Institution Name
//               </label>
//               <input
//                 className="w-full p-2 border border-black"
//                 defaultValue="institution name from DB"
//                 id="institutionName"
//                 type="text"
//               />
//             </div>
//             <div className="py-1">
//               <label htmlFor="prefferedVersion" className="font-semibold">
//                 Preferred Version
//               </label>
//               <select className="w-full p-2 border border-black" defaultValue="Bangla" id="prefferedVersion">
//                 <option value="ban">Bangla</option>
//                 <option value="eng">English</option>
//               </select>
//             </div>
//             <div className="py-1">
//               <label htmlFor="userEmail" className="font-semibold">
//                 Email
//               </label>
//               <input
//                 className="w-full p-2 border border-black"
//                 defaultValue="email from DB"
//                 id="userEmail"
//                 type="email"
//               />
//             </div>
//             <div className="py-1">
//               <label htmlFor="userMobileNo" className="font-semibold">
//                 Mobile No
//               </label>
//               <input
//                 className="w-full p-2 border border-black"
//                 defaultValue="no from DB"
//                 id="userMobileNo"
//                 type="text"
//               />
//             </div>
//             <div className="py-1">
//               <label htmlFor="userNewPassword" className="font-semibold">
//                 New Password (Change Password)
//               </label>
//               <input className="w-full p-2 border border-black" id="userNewPassword" type="password" />
//             </div>
//             <div className="py-1">
//               <label htmlFor="userPassword" className="font-semibold">
//                 Current Password (To save current changes)
//               </label>
//               <input className="w-full p-2 border border-black" autoFocus id="userPassword" type="password" />
//             </div>
//             <div className="w-full my-10 flex justify-center">
//               <button className="bg-black text-l px-4 py-1 rounded-md text-white font-semibold hover:bg-blue-800">
//                 Save Changes
//               </button>
//             </div>
//           </form>
//         </SheetContent>
//       </Sheet>
//     </Menubar>
//   )
// }

// export function MenubarDemo({ children }: { children: React.ReactNode }) {
//   return (
//     <AuthProvider>
//       <MenubarContentComponent />
//       {children}
//     </AuthProvider>
//   )
// }






"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { useRouter } from "next/navigation"
import { CgProfile } from "react-icons/cg"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"

interface AuthContextType {
  userId: string | null
  isLoggedIn: boolean
  login: (id: string) => void
  logout: () => void
  refreshAuthStatus: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const checkAuthStatus = useCallback(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId")
      setUserId(storedUserId)
      setIsLoggedIn(!!storedUserId)
    }
  }, [])

  useEffect(() => {
    checkAuthStatus()

    const handleStorageChange = () => {
      checkAuthStatus()
    }
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [checkAuthStatus])

  const login = useCallback((id: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userId", id)
      setUserId(id)
      setIsLoggedIn(true)
    }
  }, [])

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userId")
      setUserId(null)
      setIsLoggedIn(false)
    }
  }, [])

  const refreshAuthStatus = useCallback(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  return (
    <AuthContext.Provider value={{ userId, isLoggedIn, login, logout, refreshAuthStatus }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

function MenubarContentComponent() {
  const router = useRouter()
  const { isLoggedIn, logout, userId } = useAuth()

  // Profile state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNo: "",
    institutionName: "",
    version: "bangla",
  })
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [profileSuccess, setProfileSuccess] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch profile data when sheet opens
  const fetchProfileData = async () => {
    if (!userId) return

    setIsProfileLoading(true)
    setProfileError("")

    try {
      const res = await fetch(`/Api/profile?userId=${userId}`)
      const data = await res.json()

      if (data.success) {
        setProfileData(data.data)
      } else {
        setProfileError(data.message || "Failed to load profile")
      }
    } catch (error) {
      setProfileError("Network error occurred")
      console.error("Profile fetch error:", error)
    } finally {
      setIsProfileLoading(false)
    }
  }

  const handleLogout = () => {
     window.location.reload()
    logout()
    router.push("/")
  }

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUpdating(true)
    setProfileError("")
    setProfileSuccess("")

    const formData = new FormData(e.currentTarget)
    const currentPasswordInput = e.currentTarget.querySelector('[name="currentPassword"]') as HTMLInputElement
    const newPasswordInput = e.currentTarget.querySelector('[name="newPassword"]') as HTMLInputElement

    const currentPassword = currentPasswordInput?.value || ""
    const newPassword = newPasswordInput?.value || ""

    if (!currentPassword) {
      setProfileError("Current password is required to save changes")
      setIsUpdating(false)
      return
    }

    try {
      const updateData = {
        userId,
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        mobileNo: formData.get("mobileNo") as string,
        institutionName: formData.get("institutionName") as string,
        version: formData.get("version") as string,
        currentPassword,
        ...(newPassword && { newPassword }),
      }

      const res = await fetch("/Api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      const data = await res.json()

      if (data.success) {
        setProfileSuccess("Profile updated successfully!")
        setProfileData(data.data) 
        if (currentPasswordInput) currentPasswordInput.value = ""
        if (newPasswordInput) newPasswordInput.value = ""
      } else {
        setProfileError(data.message || "Failed to update profile")
      }
    } catch (error) {
      setProfileError("Network error occurred")
      console.error("Profile update error:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Menubar className=" justify-between fixed w-full top-0 z-10">
      <p className="text-3xl font-extrabold text-black-300 drop-shadow-xl text-shadow-lg">TestBilder</p>
      <div className="flex gap-4">
        <MenubarMenu>
          <MenubarTrigger>
            <Link href="/">Home</Link>
          </MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>My Question</MenubarTrigger>
          <MenubarContent>
            <MenubarRadioGroup value="createNew">
              <Link href="/createQuestionPrimaryInfo">
                <MenubarRadioItem value="createNew">Create New</MenubarRadioItem>
              </Link>
              <Link href="/incomplete">
                <MenubarRadioItem value="incomplete">Incomplete</MenubarRadioItem>
              </Link>
              <Link href="/complete">
                <MenubarRadioItem value="complete">Complete</MenubarRadioItem>
              </Link>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          {isLoggedIn ? (
            <MenubarTrigger onClick={handleLogout}>Logout</MenubarTrigger>
          ) : (
            <MenubarTrigger asChild>
              <Link href="/login">Login</Link>
            </MenubarTrigger>
          )}
        </MenubarMenu>
      </div>
      <Sheet>
        <SheetTrigger onClick={fetchProfileData}>
          <div className="flex items-center gap-1">
            <CgProfile /> Profile
          </div>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Your Profile</SheetTitle>
            <SheetDescription>
              If you edit your profile, it will reflect in your new exam template. You must provide your current
              password to save changes.
            </SheetDescription>
          </SheetHeader>

          {isProfileLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <form className="px-4 h-full overflow-y-auto" onSubmit={handleProfileSubmit}>
              {profileError && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{profileError}</div>}
              {profileSuccess && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{profileSuccess}</div>}

              <div className="py-1">
                <label htmlFor="firstName" className="font-semibold">
                  First Name
                </label>
                <input
                  className="w-full p-2 border border-black"
                  defaultValue={profileData.firstName}
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                />
              </div>

              <div className="py-1">
                <label htmlFor="lastName" className="font-semibold">
                  Last Name
                </label>
                <input
                  className="w-full p-2 border border-black"
                  defaultValue={profileData.lastName}
                  id="lastName"
                  name="lastName"
                  type="text"
                  
                />
              </div>

              <div className="py-1">
                <label htmlFor="institutionName" className="font-semibold">
                  Institution Name
                </label>
                <input
                  className="w-full p-2 border border-black"
                  defaultValue={profileData.institutionName}
                  id="institutionName"
                  name="institutionName"
                  type="text"
                />
              </div>

              <div className="py-1">
                <label htmlFor="version" className="font-semibold">
                  Preferred Version
                </label>
                <select
                  className="w-full p-2 border border-black"
                  defaultValue={profileData.version}
                  id="version"
                  name="version"
                >
                  <option value="bangla">Bangla</option>
                  <option value="english">English</option>
                </select>
              </div>

              <div className="py-1">
                <label htmlFor="userEmail" className="font-semibold">
                  Email (Cannot be changed)
                </label>
                <input
                  className="w-full p-2 border border-gray-300 bg-gray-100"
                  value={profileData.email}
                  id="userEmail"
                  type="email"
                  disabled
                />
              </div>

              <div className="py-1">
                <label htmlFor="mobileNo" className="font-semibold">
                  Mobile No
                </label>
                <input
                  className="w-full p-2 border border-black"
                  defaultValue={profileData.mobileNo}
                  id="mobileNo"
                  name="mobileNo"
                  type="text"
                  required
                />
              </div>

              <div className="py-1">
                <label htmlFor="newPassword" className="font-semibold">
                  New Password (Leave blank to keep current)
                </label>
                <input className="w-full p-2 border border-black" id="newPassword" name="newPassword" type="password" />
              </div>

              <div className="py-1">
                <label htmlFor="currentPassword" className="font-semibold">
                  Current Password (Required to save changes) *
                </label>
                <input
                  className="w-full p-2 border border-black"
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                />
              </div>

              <div className="w-full my-10 flex justify-center">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-black text-l px-4 py-1 rounded-md text-white font-semibold hover:bg-blue-800 disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </Menubar>
  )
}

export function MenubarDemo({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MenubarContentComponent />
      {children}
    </AuthProvider>
  )
}
