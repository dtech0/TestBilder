


"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import ImageDropzone from "@/components/ImageDropzone"
import debounce from "lodash/debounce"

interface SubQuestion {
  questionText: string
  marks: number
  banglaNum: string
  englishNum: string
  image?: string
}

interface CQQuestion {
  questionText: string
  marks: number
  passageImage?: string
  subQuestions: SubQuestion[]
}

interface CQ {
  cqType: "cq-1" | "cq-2"
  parentIdx: number
  containedQuestion: number
  id?: string
  questions: CQQuestion[]
  isComplete: boolean
  _id?: string
}

type Props = {
  css?: string
  cqTempIdx?: string
  cqTemplet: CQ[]
  index?: string
  pIdx: number
  setCqTemplet: (newTemplate: CQ[]) => void
  children?: React.ReactNode
  onDelete?: () => void
}

function generateCqTempletComponent(
  cqInfo: { qNum: number; banglaNum: string; englishNum: string; defaultMarks: number }[],
) {
  return function Template({ children, pIdx, cqTemplet, setCqTemplet }: Props) {
    const currentCQ = cqTemplet[pIdx]
    const currentQuestion = currentCQ?.questions?.[0]

    const [formData, setFormData] = useState({
      questionText: currentQuestion?.questionText || "",
      passageImage: currentQuestion?.passageImage || "",
      subQuestions:
        currentQuestion?.subQuestions ||
        cqInfo.map((item) => ({
          questionText: "",
          marks: item.defaultMarks,
          banglaNum: item.banglaNum,
          englishNum: item.englishNum,
          image: "",
        })),
    })

    const [isExternalUpdate, setIsExternalUpdate] = useState(false)

    const updateTemplate = useCallback(
      debounce(() => {
        if (!cqTemplet[pIdx] || isExternalUpdate) return

        const updatedCQ = {
          ...cqTemplet[pIdx],
          questions: [
            {
              questionText: formData.questionText,
              passageImage: formData.passageImage,
              marks: formData.subQuestions.reduce((sum, q) => sum + q.marks, 0),
              subQuestions: formData.subQuestions,
            },
          ],
          isComplete: !!(
            (formData.questionText.trim() || formData.passageImage.trim()) &&
            formData.subQuestions.every((q) => q.questionText.trim() || q.image?.trim())
          ),
        }

        const prevCQ = cqTemplet[pIdx]
        const isSame =
          JSON.stringify(prevCQ.questions) === JSON.stringify(updatedCQ.questions) &&
          prevCQ.isComplete === updatedCQ.isComplete

        if (!isSame) {
          const updatedTemplate = [...cqTemplet]
          updatedTemplate[pIdx] = updatedCQ
          setCqTemplet(updatedTemplate)
        }
      }, 300),
      [cqTemplet, pIdx, formData, setCqTemplet, isExternalUpdate],
    )

    useEffect(() => {
      if (!isExternalUpdate) {
        updateTemplate()
      }
      return () => {
        updateTemplate.cancel()
      }
    }, [formData, updateTemplate, isExternalUpdate])

    useEffect(() => {
      const current = cqTemplet[pIdx]?.questions?.[0]
      if (!current) return

      const hasSignificantChange =
        current.questionText !== formData.questionText ||
        current.passageImage !== formData.passageImage ||
        JSON.stringify(current.subQuestions) !== JSON.stringify(formData.subQuestions)

      if (hasSignificantChange && !isExternalUpdate) {
        setIsExternalUpdate(true)
        setFormData({
          questionText: current.questionText || "",
          passageImage: current.passageImage || "",
          subQuestions: current.subQuestions || formData.subQuestions,
        })

        setTimeout(() => setIsExternalUpdate(false), 100)
      }
    }, [cqTemplet, pIdx])

    const handlePassageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, questionText: e.target.value }))
    }

    const handleSubChange = (index: number, field: keyof SubQuestion, value: string | number) => {
      setFormData((prev) => {
        const updated = [...prev.subQuestions]
        updated[index] = { ...updated[index], [field]: value }
        return { ...prev, subQuestions: updated }
      })
    }

    const handleSubImageChange = (index: number, url: string) => {
      console.log(`Updating sub-question ${index} image:`, url)
      handleSubChange(index, "image", url)
    }

    const handlePassageImageChange = (url: string) => {
      console.log("Updating passage image:", url)
      setFormData((prev) => ({ ...prev, passageImage: url }))
    }

    return (
      <div className="w-full">
        <div className="bg-blue-100 mx-auto max-w-220 p-3 rounded-2xl mb-2">
          <div className="p-1 rounded-xl mb-2">
            <Label htmlFor={`passage-${pIdx}`}>উদ্দীপক (Passage)</Label>
            <textarea
              id={`passage-${pIdx}`}
              className="bg-white p-3 rounded-xl w-full mt-2"
              rows={4}
              value={formData.questionText}
              onChange={handlePassageChange}
              placeholder="উদ্দীপকটি লিখুন (Write the passage)"
            />
            <ImageDropzone
              imgFor={`Passage-${pIdx}`}
              image={formData.passageImage}
              onImageChange={handlePassageImageChange}
            />
          </div>

          {formData.subQuestions.map((item, idx) => (
            <form key={`${pIdx}-${idx}`} className="bg-blue-300 p-2 rounded-xl mb-2">
              <div className="flex items-center">
                <h4 className="font-semibold w-12 mt-6 mb-2">
                  {item.banglaNum} ({item.englishNum})
                </h4>
                <div className="flex w-full justify-between">
                  <div className="mb-2 w-full">
                    <Label htmlFor={`q${pIdx}-${idx}`}>প্রশ্ন (Question)</Label>
                    <Input
                      id={`q${pIdx}-${idx}`}
                      placeholder={`প্রশ্ন ${item.banglaNum} লিখুন`}
                      type="text"
                      value={item.questionText}
                      onChange={(e) => handleSubChange(idx, "questionText", e.target.value)}
                    />
                  </div>
                  <div className="mb-2">
                    <Label htmlFor={`marks${pIdx}-${idx}`}>নম্বর (Marks)</Label>
                    <Input
                      id={`marks${pIdx}-${idx}`}
                      placeholder="নম্বর"
                      type="number"
                      className="w-20"
                      value={item.marks}
                      onChange={(e) => handleSubChange(idx, "marks", Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              <ImageDropzone
                imgFor={`Question${item.englishNum}-${pIdx}-${idx}`}
                image={item.image || ""}
                onImageChange={(url) => handleSubImageChange(idx, url)}
              />
            </form>
          ))}

          <div className="flex justify-between mt-4">{children}</div>
        </div>
      </div>
    )
  }
}

const CqTemplet_1 = generateCqTempletComponent([
  { qNum: 1, banglaNum: "ক", englishNum: "A", defaultMarks: 1 },
  { qNum: 2, banglaNum: "খ", englishNum: "B", defaultMarks: 2 },
  { qNum: 3, banglaNum: "গ", englishNum: "C", defaultMarks: 3 },
  { qNum: 4, banglaNum: "ঘ", englishNum: "D", defaultMarks: 4 },
])

const CqTemplet_2 = generateCqTempletComponent([
  { qNum: 1, banglaNum: "ক", englishNum: "A", defaultMarks: 2 },
  { qNum: 2, banglaNum: "খ", englishNum: "B", defaultMarks: 4 },
  { qNum: 3, banglaNum: "গ", englishNum: "C", defaultMarks: 4 },
])

const DelBtnCQ = ({ pIdx, setCqTemplet, cqTemplet, onDelete }: Props) => {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (onDelete) {
      onDelete()
      return
    }

    const updatedTemplate = cqTemplet.filter((_, index) => index !== pIdx)
    setCqTemplet(updatedTemplate)
  }

  return (
    <button
      className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 p-2 text-sm rounded-xl"
      onClick={handleDelete}
      type="button"
    >
      Delete CQ
    </button>
  )
}

export { CqTemplet_1, CqTemplet_2, DelBtnCQ }
