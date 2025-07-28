


// "use client"

// import { useEffect, useRef, useState, useCallback } from "react"
// import { useRouter, useSearchParams } from "next/navigation"
// import { CqTemplet_1, CqTemplet_2, DelBtnCQ } from "@/components/ui/cqTemplet"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import debounce from "lodash/debounce"

// const CQ = () => {
//   const [cqTemplet, setCqTemplet] = useState<any[]>([])
//   const [cqTempletName, setCqTempletName] = useState<string>("cq-1")
//   const [userId, setUserId] = useState<string | null>(null)
//   const [primaryInfoId, setPrimaryInfoId] = useState<string | null>(null)
//   const [templateId, setTemplateId] = useState<string | null>(null)
//   const [errorMsg, setErrorMsg] = useState<string | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

//   const router = useRouter()
//   const searchParams = useSearchParams()

//   // Auto-save function with proper error handling
//   const saveToDatabase = useCallback(
//     async (updatedTemplate: any[]) => {
//       if (!userId || !primaryInfoId || !templateId) {
//         console.log("Missing IDs for auto-save:", { userId, primaryInfoId, templateId })
//         return
//       }

//       setSaveStatus("saving")

//       try {
//         const res = await fetch("/Api/cq", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             operation: "update",
//             templateId: templateId,
//             user: userId,
//             primaryInfo: primaryInfoId,
//             cqs: updatedTemplate,
//           }),
//         })

//         const data = await res.json()
//         if (data.success) {
//           setSaveStatus("saved")
//           console.log("CQ Template auto-saved successfully")
//           setTimeout(() => setSaveStatus("idle"), 2000)
//         } else {
//           setSaveStatus("error")
//           console.error("Auto-save failed:", data.message)
//           setTimeout(() => setSaveStatus("idle"), 3000)
//         }
//       } catch (err) {
//         setSaveStatus("error")
//         console.error("Auto-save network error:", err)
//         setTimeout(() => setSaveStatus("idle"), 3000)
//       }
//     },
//     [userId, primaryInfoId, templateId],
//   )

//   const debouncedSaveRef = useRef<any>(null)

//   useEffect(() => {
//     debouncedSaveRef.current = debounce(saveToDatabase, 1000)
//     return () => {
//       if (debouncedSaveRef.current) {
//         debouncedSaveRef.current.cancel()
//       }
//     }
//   }, [saveToDatabase])

//   const loadExistingTemplate = async (tempId: string) => {
//     try {
//       const res = await fetch(`/Api/cq?templateId=${tempId}`, {
//         method: "GET",
//       })
//       const data = await res.json()
//       if (data.success && data.data.cqs) {
//         setCqTemplet(data.data.cqs)
//         console.log("Loaded existing CQ template:", data.data.cqs.length, "CQs")
//       } else {
//         console.error("Failed to load template:", data.message)
//       }
//     } catch (error) {
//       console.error("Error loading CQ template:", error)
//     }
//   }

//   useEffect(() => {
//     const initializeData = async () => {
//       if (typeof window !== "undefined") {
//         const storedUserId = localStorage.getItem("userId")
//         if (storedUserId) {
//           setUserId(storedUserId)
//         } else {
//           setErrorMsg("User not logged in! Redirecting to login...")
//           setTimeout(() => router.push("/login"), 2000)
//           return
//         }

//         const primaryId = searchParams.get("primaryId")
//         const tempId = searchParams.get("templateId")

//         if (primaryId) {
//           setPrimaryInfoId(primaryId)
//         } else {
//           setErrorMsg("Missing primaryId in URL!")
//         }

//         if (tempId) {
//           setTemplateId(tempId)
//           await loadExistingTemplate(tempId)
//         } else {
//           setErrorMsg("Missing templateId in URL!")
//         }
//       }

//       setIsLoading(false)
//     }

//     initializeData()
//   }, [])

//   const handleAddCQGroup = useCallback(() => {
//     setCqTemplet((prevCqTemplet) => {
//       const newCQ = {
//         cqType: cqTempletName,
//         parentIdx: prevCqTemplet.length,
//         containedQuestion: cqTempletName === "cq-1" ? 4 : 3,
//         questions: [
//           {
//             questionText: "",
//             passageImage: "",
//             marks: 0,
//             subQuestions: Array.from({ length: cqTempletName === "cq-1" ? 4 : 3 }, (_, idx) => ({
//               questionText: "",
//               marks: cqTempletName === "cq-1" ? [1, 2, 3, 4][idx] : [2, 4, 4][idx],
//               banglaNum: ["ক", "খ", "গ", "ঘ"][idx],
//               englishNum: ["A", "B", "C", "D"][idx],
//               image: "",
//             })),
//           },
//         ],
//         isComplete: false,
//       }

//       const updated = [...prevCqTemplet, newCQ]

//       if (debouncedSaveRef.current) {
//         debouncedSaveRef.current(updated)
//       }

//       return updated
//     })
//   }, [cqTempletName])

//   const handleDeleteCQ = useCallback(
//     async (pIdx: number) => {
//       if (!templateId) return

//       try {
//         const res = await fetch(`/Api/cq?templateId=${templateId}&cqIndex=${pIdx}`, {
//           method: "DELETE",
//         })

//         const data = await res.json()
//         if (data.success) {
//           setCqTemplet(data.data.cqs)
//           console.log("CQ deleted successfully")
//         } else {
//           console.error("Delete failed:", data.message)
//         }
//       } catch (error) {
//         console.error("Delete error:", error)
//       }
//     },
//     [templateId],
//   )

//   const updateQuestionData = useCallback((newTemplate: any[]) => {
//     setCqTemplet(newTemplate)

//     if (debouncedSaveRef.current) {
//       debouncedSaveRef.current(newTemplate)
//     }
//   }, [])

//   const handleGeneratePDF = useCallback(async () => {
//     if (!userId || !primaryInfoId || !templateId) {
//       alert("Missing required IDs")
//       return
//     }

//     if (debouncedSaveRef.current) {
//       debouncedSaveRef.current.cancel()
//     }

//     setSaveStatus("saving")

//     try {
//       const res = await fetch("/Api/cq", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           operation: "update",
//           templateId: templateId,
//           user: userId,
//           primaryInfo: primaryInfoId,
//           cqs: cqTemplet,
//         }),
//       })

//       const data = await res.json()
//       if (data.success) {
//         setSaveStatus("saved")
//         console.log("CQ template saved, redirecting to PDF generation...")

//         router.push(`/CQ?templateId=${templateId}`)
//       } else {
//         setSaveStatus("error")
//         alert("Error saving template: " + data.message)
//       }
//     } catch (error) {
//       setSaveStatus("error")
//       console.error("Save error:", error)
//       alert("Network error occurred")
//     }
//   }, [userId, primaryInfoId, templateId, cqTemplet, router])

//   const renderCQComponent = useCallback(
//     (item: any, index: number) => {
//       const sharedProps = {
//         pIdx: index,
//         cqTemplet: cqTemplet,
//         setCqTemplet: updateQuestionData,
//         children: (
//           <DelBtnCQ
//             pIdx={index}
//             cqTemplet={cqTemplet}
//             setCqTemplet={updateQuestionData}
//             onDelete={() => handleDeleteCQ(index)}
//           />
//         ),
//       }

//       switch (item.cqType) {
//         case "cq-1":
//           return <CqTemplet_1 key={item.id || index} {...sharedProps} />
//         case "cq-2":
//           return <CqTemplet_2 key={item.id || index} {...sharedProps} />
//         default:
//           return null
//       }
//     },
//     [cqTemplet, updateQuestionData, handleDeleteCQ],
//   )

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p>Loading CQ template...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="my-15 w-full">
//       {errorMsg && <div className="text-red-600 text-center my-4 font-semibold">{errorMsg}</div>}

//       <div className="justify-between items-center w-full fixed top-[100px] z-10">
//         <div className="justify-between item-center w-full flex bg-gray-400 p-2 rounded-2xl max-w-200 m-auto">
//           <div className="flex items-center text-md font-semibold">
//             <div className="w-22">CQ Type: </div>
//             <Select key="cq-type-select" defaultValue="cq-1" value={cqTempletName} onValueChange={setCqTempletName}>
//               <SelectTrigger className="min-w-[380px] bg-white">
//                 <SelectValue placeholder="Select CQ type" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="cq-1">Including 4 questions</SelectItem>
//                 <SelectItem value="cq-2">Including 3 questions</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//           <div>
//             <button
//               className="px-6 mx-3 hover:bg-blue-700 py-1 text-white rounded-xl bg-black disabled:opacity-50"
//               onClick={handleAddCQGroup}
//               disabled={!!errorMsg}
//               type="button"
//             >
//               Add
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="mt-[120px]">{cqTemplet.map((item, idx) => renderCQComponent(item, idx))}</div>

//       <div className="justify-center flex text-white my-5">
//         <button
//           onClick={handleGeneratePDF}
//           className="px-3 py-1 bg-black text-white rounded-md hover:bg-blue-700 font-semibold disabled:opacity-50"
//           disabled={!!errorMsg || saveStatus === "saving" || cqTemplet.length === 0}
//           type="button"
//         >
//           {saveStatus === "saving" ? "Saving & Generating..." : "Generate PDF"}
//         </button>
//       </div>

//       <div className="text-center mt-4">
//         <span
//           className={`text-sm font-medium ${
//             saveStatus === "saving"
//               ? "text-blue-600"
//               : saveStatus === "saved"
//                 ? "text-green-600"
//                 : saveStatus === "error"
//                   ? "text-red-600"
//                   : "text-gray-500"
//           }`}
//         >
// <div className="text-center mt-6 mb-6 text-lg text-blue-700 font-semibold bg-blue-100 py-2 rounded-xl w-fit mx-auto px-4 shadow">
//         {cqTemplet.length} CQ{cqTemplet.length !== 1 ? "'s" : ""} added
//       </div>
//           {saveStatus === "saving" && "Auto-saving..."}
//           {saveStatus === "saved" && "Auto-saved successfully"}
//           {saveStatus === "error" && "Auto-save failed"}
//           {saveStatus === "idle" && "🔄 Auto-save enabled"}
//         </span>
//       </div>

     
//     </div>
//   )
// }

// export default CQ




'use client'

import dynamic from 'next/dynamic'

const CQClient = dynamic(() => import('./CQClient'), { ssr: false })

export default function CQWrapper() {
  return <CQClient />
}
