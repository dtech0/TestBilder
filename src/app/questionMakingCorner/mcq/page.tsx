



"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { DelBtn, MCQTemplet_1, MCQTemplet_2, MCQTemplet_3, MCQTemplet_4 } from "@/components/ui/mcqTemplet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, Check, Clock, AlertCircle } from "lucide-react"
import debounce from "lodash/debounce"

const Mcq = () => {
  const [mcqTemplet, setMcqTemplet] = useState<any[][]>([])
  const [mcqTempletName, setMcqTempletName] = useState<string>("mcq-1")
  const [templateId, setTemplateId] = useState<string | null>(null)

  const [userId, setUserId] = useState<string | null>(null)
  const [primaryInfoId, setPrimaryInfoId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [lastSaved, setLastSaved] = useState<Date | undefined>()
  const [generatingPDF, setGeneratingPDF] = useState<boolean>(false)

  const saveInProgressRef = useRef(false)
  const router = useRouter()

  const autoSaveData = async (data: any[]) => {
    if (!userId || !primaryInfoId || data.length === 0 || saveInProgressRef.current) {
      return
    }

    saveInProgressRef.current = true
    setSaveStatus("saving")

    try {
      const res = await fetch("/Api/mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userId,
          primaryInfo: primaryInfoId,
          mcqs: data,
          operation: "update",
        }),
      })

      const result = await res.json()

      if (result.success) {
        setSaveStatus("saved")
        setLastSaved(new Date())
        setTimeout(() => setSaveStatus("idle"), 2000)
      } else {
        setSaveStatus("error")
        console.error("Auto-save failed:", result.message)

        if (result.error === "VERSION_CONFLICT") {
          console.log("Version conflict detected, will retry on next change")
        }
      }
    } catch (error) {
      setSaveStatus("error")
      console.error("Auto-save error:", error)
    } finally {
      saveInProgressRef.current = false
    }
  }

  const debouncedSave = useCallback(
    debounce((data: any[]) => autoSaveData(data), 1000),
    [userId, primaryInfoId],
  )

  useEffect(() => {
    if (mcqTemplet.length > 0 && userId && primaryInfoId) {
      debouncedSave(mcqTemplet)
    }
  }, [mcqTemplet, debouncedSave, userId, primaryInfoId])

  const handleDeleteIndividualMCQ = async (mcqId: string) => {
    if (!userId || !primaryInfoId) return

    try {
      const res = await fetch("/Api/mcq", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userId,
          primaryInfo: primaryInfoId,
          mcqId: mcqId,
          deleteType: "single",
        }),
      })

      const data = await res.json()
      if (data.success) {
        const filtered = data.data.mcqs.filter((group: any[]) => Array.isArray(group) && group.length > 0 && group[0])
        setMcqTemplet(filtered)
      } else {
        alert("Error deleting MCQ: " + data.message)
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Network error occurred")
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      if (typeof window !== "undefined") {
        const storedUserId = localStorage.getItem("userId")
        if (storedUserId) {
          setUserId(storedUserId)
        } else {
          setErrorMsg("User not logged in! Redirecting to login...")
          return
        }

        const params = new URLSearchParams(window.location.search)
        const idFromUrl = params.get("primaryId")
        const templateFromUrl = params.get("templateId")
        if (templateFromUrl) {
          setTemplateId(templateFromUrl)
        }

        if (idFromUrl) {
          setPrimaryInfoId(idFromUrl)

          try {
            const response = await fetch(`/Api/mcq?user=${storedUserId}&primaryInfo=${idFromUrl}`)
            const data = await response.json()
            console.log("✅ fetched mcq data:", data)
            if (data.success && Array.isArray(data.data.mcqs)) {
              const validMCQs = data.data.mcqs.filter(
                (group: any[]) => Array.isArray(group) && group.length > 0 && group[0],
              )
              setMcqTemplet(validMCQs)
            }
          } catch (error) {
            console.error("Error loading existing data:", error)
          }
        } else {
          setErrorMsg("Missing primaryId in URL!")
        }
      }
      setLoading(false)
    }

    initializeData()
  }, [router])

  const handleAddMcqGroup = () => {
    let newGroup
    if (mcqTempletName === "mcq-4") {
      newGroup = [
        {
          mcqType: mcqTempletName,
          parentIdx: mcqTemplet.length,
          passage: "",
          passageImage: "",
          subQuestions: [],
        },
      ]
    } else {
      newGroup = [
        {
          mcqType: mcqTempletName,
          parentIdx: mcqTemplet.length,
          questionText: "",
          image: "",
          options: mcqTempletName === "mcq-2" ? ["", ""] : ["", "", "", ""],
          correctAnswer: "",
          marks: 1,
          ...(mcqTempletName === "mcq-3" && { infoItems: ["", "", ""] }),
        },
      ]
    }
    setMcqTemplet((prev) => [...prev, newGroup])
  }

  const handleGeneratePDF = async () => {
    if (!userId || !primaryInfoId) {
      alert("User ID or Primary Info ID missing")
      return
    }

    if (mcqTemplet.length === 0) {
      alert("No MCQ data to save and generate")
      return
    }

    setGeneratingPDF(true)

    debouncedSave.cancel()

    try {
      const res = await fetch("/Api/mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userId,
          primaryInfo: primaryInfoId,
          mcqs: mcqTemplet,
          operation: "final_save",
        }),
      })

      const data = await res.json()

      if (data.success && data.data?._id) {
        router.push(`/MCQ?templateId=${data.data._id}`)
      } else {
        alert("Failed to generate: " + (data.message || "Unknown error"))
      }
    } catch (error) {
      console.error("Error during save and redirect:", error)
      alert("Network error occurred")
    } finally {
      setGeneratingPDF(false)
    }
  }

  const renderMcqComponent = (item: any[], arrayIndex: number) => {
    if (!Array.isArray(item) || item.length === 0 || !item[0]) return null

    const keyValue = item[0]?._id || item[0]?.id || `group-${arrayIndex}`

    const deleteBtn = (
      <DelBtn
        pIdx={arrayIndex}
        setMcqTemplet={setMcqTemplet}
        mcqTemplet={mcqTemplet}
        onDeleteIndividual={handleDeleteIndividualMCQ}
      />
    )

    const commonProps = {
      pIdx: arrayIndex,
      mcqTemplet,
      setMcqTemplet,
      onDeleteIndividual: handleDeleteIndividualMCQ,
    }

    switch (item[0]?.mcqType) {
      case "mcq-1":
        return (
          <MCQTemplet_1 key={keyValue} {...commonProps}>
            {deleteBtn}
          </MCQTemplet_1>
        )
      case "mcq-2":
        return (
          <MCQTemplet_2 key={keyValue} {...commonProps}>
            {deleteBtn}
          </MCQTemplet_2>
        )
      case "mcq-3":
        return (
          <MCQTemplet_3 key={keyValue} {...commonProps}>
            {deleteBtn}
          </MCQTemplet_3>
        )
      case "mcq-4":
        return (
          <MCQTemplet_4 key={keyValue} {...commonProps}>
            {deleteBtn}
          </MCQTemplet_4>
        )
      default:
        return null
    }
  }

  const SaveStatusIndicator = () => {
    const getStatusIcon = () => {
      switch (saveStatus) {
        case "saving":
          return <Clock className="w-4 h-4 animate-spin" />
        case "saved":
          return <Check className="w-4 h-4 text-green-500" />
        case "error":
          return <AlertCircle className="w-4 h-4 text-red-500" />
        default:
          return null
      }
    }

    const getStatusText = () => {
      switch (saveStatus) {
        case "saving":
          return "Saving..."
        case "saved":
          return "Saved"
        case "error":
          return "Save failed - will retry"
        default:
          return lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : ""
      }
    }

    if (saveStatus === "idle" && !lastSaved) return null

    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>
    )
  }

  const getTotalMcqCount = () => {
    let total = 0
    mcqTemplet.forEach((group) => {
      if (!Array.isArray(group) || group.length === 0 || !group[0]) return
      const type = group[0].mcqType
      if (type === "mcq-4" && Array.isArray(group[0].subQuestions)) {
        total += group[0].subQuestions.length
      } else {
        total += 1
      }
    })
    return total
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <div className="my-15 w-full">
      <div className="justify-between items-center w-full fixed top-[100px] z-10">
        <div className="justify-between item-center w-full flex bg-gray-400 p-2 rounded-2xl max-w-200 m-auto">
          <div className="flex items-center text-md font-semibold">
            <div className="w-22">MCQ Type: </div>
            <Select defaultValue="mcq-1" value={mcqTempletName} onValueChange={setMcqTempletName}>
              <SelectTrigger className="min-w-[380px] bg-white">
                <SelectValue placeholder="Select MCQ type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq-1">সাধারণ বহুনির্বাচনী</SelectItem>
                <SelectItem value="mcq-2">সত্য/মিথ্যা</SelectItem>
                <SelectItem value="mcq-3">বহুপদী ও সমাপ্তিসূচক</SelectItem>
                <SelectItem value="mcq-4">অভিন্ন তথ্যভিত্তিক</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <SaveStatusIndicator />
            <Button
              onClick={handleAddMcqGroup}
              className="px-6 mx-3 hover:bg-blue-700 py-1 text-white rounded-xl bg-black"
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-20">
        {mcqTemplet.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No MCQ templates added yet.</p>
            <p>Click "Add" button to create your first MCQ.</p>
          </div>
        ) : (
          mcqTemplet.map((item, arrayIndex) => renderMcqComponent(item, arrayIndex))
        )}
      </div>

      <div className="justify-center flex text-white mt-10 gap-4">
        <Button
          onClick={handleGeneratePDF}
          disabled={generatingPDF || mcqTemplet.length === 0}
          className="px-3 py-1 bg-black text-white rounded-md hover:bg-blue-700 font-semibold disabled:opacity-50"
        >
          {generatingPDF ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate PDF"
          )}
        </Button>
      </div>

      <div className="text-center mt-6 mb-6 text-lg text-blue-700 font-semibold bg-blue-100 py-2 rounded-xl w-fit mx-auto px-4 shadow">
        {getTotalMcqCount()} MCQ{getTotalMcqCount() !== 1 ? "'s" : ""} added
      </div>

      {errorMsg && <div className="text-center text-red-500 mt-4">{errorMsg}</div>}
    </div>
  )
}

export default Mcq



// 'use client'

// import dynamic from 'next/dynamic'

// const CQClient = dynamic(() => import('./MCQClient'), { ssr: false })

// export default function CQWrapper() {
//   return <CQClient />
// }
