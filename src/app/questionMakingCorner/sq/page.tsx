

"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SqTemplet, DelBtnSQ } from "@/components/ui/sqTemplet"
import debounce from "lodash/debounce"

interface SQQuestion {
  id: string
  parentIdx: number
  questionText: string
  image?: string
  marks: number
  isComplete: boolean
}

const SQ = () => {
  const [sqTemplet, setSqTemplet] = useState<SQQuestion[]>([])
  const [sqTempletName, setSqTempletName] = useState<string>("sq-1")
  const [userId, setUserId] = useState<string | null>(null)
  const [primaryInfoId, setPrimaryInfoId] = useState<string | null>(null)
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")

  const router = useRouter()
  const searchParams = useSearchParams()
  const debouncedSaveRef = useRef<any>(null)

  const generateId = () => `${Date.now()}-${crypto.randomUUID()}`

  const saveToDatabase = useCallback(
    async (updatedTemplate: SQQuestion[]) => {
      if (!userId || !primaryInfoId || !templateId) return

      setSaveStatus("saving")

      try {
        const res = await fetch("/Api/sq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "update",
            templateId,
            user: userId,
            primaryInfo: primaryInfoId,
            sqGroup: {
              title: sqTempletName,
              questions: updatedTemplate,
              isComplete: updatedTemplate.length > 0 && updatedTemplate.every((q) => q.isComplete),
            },
          }),
        })

        const data = await res.json()
        if (data.success) {
          setSaveStatus("saved")
          setTimeout(() => setSaveStatus("idle"), 2000)
        } else {
          setSaveStatus("error")
          setTimeout(() => setSaveStatus("idle"), 3000)
        }
      } catch {
        setSaveStatus("error")
        setTimeout(() => setSaveStatus("idle"), 3000)
      }
    },
    [userId, primaryInfoId, templateId, sqTempletName]
  )

  useEffect(() => {
    debouncedSaveRef.current = debounce(saveToDatabase, 1000)
    return () => debouncedSaveRef.current?.cancel()
  }, [saveToDatabase])

  const loadExistingTemplate = async (tempId: string) => {
    try {
      const res = await fetch(`/Api/sq?templateId=${tempId}`)
      const data = await res.json()

      if (data.success && data.data.sqGroup?.questions) {
        const questions = data.data.sqGroup.questions.map((q: any, index: number) => ({
          id: q.id || generateId(),
          parentIdx: index,
          questionText: q.questionText || "",
          image: q.image || "",
          marks: q.marks || 2,
          isComplete: !!(q.questionText?.trim() || q.image?.trim()),
        }))
        setSqTemplet(questions)
      } else {
        setErrorMsg("SQ Template not found!")
      }
    } catch (error) {
      console.error("Error loading SQ template:", error)
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      if (typeof window !== "undefined") {
        const storedUserId = localStorage.getItem("userId")
        if (!storedUserId) {
          setErrorMsg("User not logged in! Redirecting...")
          setTimeout(() => router.push("/login"), 2000)
          return
        }
        setUserId(storedUserId)

        const primaryId = searchParams.get("primaryId")
        const tempId = searchParams.get("templateId")
        if (primaryId) setPrimaryInfoId(primaryId)
        else setErrorMsg("Missing primaryId in URL!")

        if (tempId) {
          setTemplateId(tempId)
          await loadExistingTemplate(tempId)
        } else {
          setErrorMsg("Missing templateId in URL!")
        }
      }
      setIsLoading(false)
    }

    initializeData()
  }, [])

  const handleAddSQQuestion = useCallback(() => {
    setSqTemplet((prev) => {
      const newSQ: SQQuestion = {
        id: generateId(),
        parentIdx: prev.length,
        questionText: "",
        image: "",
        marks: 2,
        isComplete: false,
      }
      const updated = [...prev, newSQ]
      debouncedSaveRef.current?.(updated)
      return updated
    })
  }, [])

  const handleDeleteSQ = useCallback(
    async (pIdx: number) => {
      if (!templateId) return
      try {
        const res = await fetch(`/Api/sq?templateId=${templateId}&sqIndex=${pIdx}`, {
          method: "DELETE",
        })
        const data = await res.json()
        if (data.success) setSqTemplet(data.data.sqGroup.questions || [])
      } catch (error) {
        console.error("Delete error:", error)
      }
    },
    [templateId]
  )

  const handleQuestionTextChange = useCallback((id: string, value: string) => {
    setSqTemplet((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? { ...item, questionText: value, isComplete: !!(value.trim() || item.image?.trim()) }
          : item
      )
      debouncedSaveRef.current?.(updated)
      return updated
    })
  }, [])

  const handleImageChange = useCallback((id: string, image: string) => {
    setSqTemplet((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? { ...item, image, isComplete: !!(item.questionText?.trim() || image.trim()) }
          : item
      )
      debouncedSaveRef.current?.(updated)
      return updated
    })
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!userId || !primaryInfoId || !templateId) return

    debouncedSaveRef.current?.cancel()
    setSaveStatus("saving")

    try {
      const res = await fetch("/Api/sq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "update",
          templateId,
          user: userId,
          primaryInfo: primaryInfoId,
          sqGroup: {
            title: sqTempletName,
            questions: sqTemplet,
            isComplete: sqTemplet.length > 0 && sqTemplet.every((q) => q.isComplete),
          },
        }),
      })

      const data = await res.json()
      if (data.success) {
        setSaveStatus("saved")
        router.push(`/SQ?templateId=${templateId}`)
      } else {
        setSaveStatus("error")
      }
    } catch (error) {
      console.error("Submit error:", error)
      setSaveStatus("error")
    }
  }, [userId, primaryInfoId, templateId, sqTemplet, sqTempletName, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading SQ template...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="my-15 w-full">
      {errorMsg && <div className="text-red-600 text-center my-4 font-semibold">{errorMsg}</div>}

      <div className="fixed top-[100px] z-10 w-full flex justify-center">
        <div className="flex justify-between items-center max-w-2xl w-full bg-gray-400 p-2 rounded-2xl">
          <span className="font-semibold">Add a new Short Question</span>
          <button
            className="px-6 py-1 bg-black text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
            onClick={handleAddSQQuestion}
            disabled={!!errorMsg}
          >
            Add
          </button>
        </div>
      </div>

      <div className="mt-[120px] space-y-4">
        {sqTemplet.map((item) => (
          <SqTemplet
            key={item.id}
            value={item.questionText}
            image={item.image}
            marks={item.marks}
            onChange={(val) => handleQuestionTextChange(item.id, val)}
            onImageChange={(url) => handleImageChange(item.id, url)}
          >
            <DelBtnSQ pIdx={item.parentIdx} onDelete={() => handleDeleteSQ(item.parentIdx)} />
          </SqTemplet>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 transition-colors"
          onClick={handleSubmit}
          disabled={!!errorMsg || saveStatus === "saving"}
        >
          {saveStatus === "saving" ? "Saving & Generating..." : "Generate PDF"}
        </button>
      </div>

      <div className="text-center mt-4">
        <span
          className={`text-sm font-medium ${
            saveStatus === "saving"
              ? "text-blue-600"
              : saveStatus === "saved"
                ? "text-green-600"
                : saveStatus === "error"
                  ? "text-red-600"
                  : "text-gray-500"
          }`}
        >
          {saveStatus === "saving" && "Auto-saving..."}
          {saveStatus === "saved" && "Auto-saved successfully"}
          {saveStatus === "error" && "Auto-save failed"}
          {saveStatus === "idle" && "🔄 Auto-save enabled"}
        </span>
      </div>

      <div className="text-center mt-2 text-xs text-gray-500">
        {sqTemplet.length} question{sqTemplet.length !== 1 ? "s" : ""} added
      </div>
    </div>
  )
}

export default SQ
