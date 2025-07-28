"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ImageDropzone from "@/components/ImageDropzone"
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"

type Props = {
  children?: React.ReactNode
  css?: string
  mcqTempIdx?: string
  mcqTemplet: any[]
  index?: string
  pIdx: number
  setMcqTemplet: React.Dispatch<React.SetStateAction<any[]>>
  onDeleteIndividual?: (mcqId: string) => void
}

type PropsWithoutChildren = Omit<Props, "children">

type MCQTempletProps = {
  children?: React.ReactNode
  pIdx: number
  mcqTemplet: any[]
  setMcqTemplet: any
  onDeleteIndividual?: (mcqId: string) => void
}

// MCQ Template 1 - Standard Multiple Choice (4 options)
const MCQTemplet_1 = ({ children, pIdx, mcqTemplet, setMcqTemplet }: Props) => {
  const [formData, setFormData] = useState({
    questionText: "",
    image: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 1,
  })

  const isInitialized = useRef(false)
  const lastDataRef = useRef<string>("")

  // Load existing data when component mounts - ONLY ONCE
  useEffect(() => {
    if (!isInitialized.current && mcqTemplet[pIdx] && mcqTemplet[pIdx][0]) {
      const existingData = mcqTemplet[pIdx][0]
      const newFormData = {
        questionText: existingData.questionText || "",
        image: existingData.image || "",
        options: existingData.options || ["", "", "", ""],
        correctAnswer: existingData.correctAnswer || "",
        marks: existingData.marks || 1,
      }
      setFormData(newFormData)
      isInitialized.current = true
      lastDataRef.current = JSON.stringify(newFormData)
    }
  }, [pIdx]) // Remove mcqTemplet from dependencies

  // Update parent state whenever formData changes - with loop prevention
  useEffect(() => {
    if (isInitialized.current) {
      const currentDataString = JSON.stringify(formData)
      if (currentDataString !== lastDataRef.current) {
        setMcqTemplet((prev) => {
          const newState = [...prev]
          if (newState[pIdx] && newState[pIdx][0]) {
            newState[pIdx][0] = {
              ...newState[pIdx][0],
              ...formData,
            }
          }
          return newState
        })
        lastDataRef.current = currentDataString
      }
    }
  }, [formData, pIdx, setMcqTemplet])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleOptionChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }))
  }

  return (
    <div className="w-full">
      <form className="bg-blue-300 mx-auto max-w-4xl p-3 rounded-2xl mb-2">
        <LabelInputContainer className="mb-2">
          <Label htmlFor={`qStatement-${pIdx}`}>প্রশ্ন (Question)</Label>
          <Input
            id={`qStatement-${pIdx}`}
            placeholder="প্রশ্নটি লিখুন (Write the question)"
            type="text"
            value={formData.questionText}
            onChange={(e) => handleInputChange("questionText", e.target.value)}
          />
        </LabelInputContainer>

        <ImageDropzone
          imgFor={`MCQ1-Question-${pIdx}`}
          image={formData.image}
          onImageChange={(url) => handleInputChange("image", url)}
        />

        <div>
          <div className="flex gap-2">
            <LabelInputContainer className="mb-2 flex-1">
              <Label htmlFor={`op1-${pIdx}`}>ক/ Option A</Label>
              <Input
                id={`op1-${pIdx}`}
                placeholder="ক/A"
                type="text"
                value={formData.options[0]}
                onChange={(e) => handleOptionChange(0, e.target.value)}
              />
            </LabelInputContainer>
            <LabelInputContainer className="mb-2 flex-1">
              <Label htmlFor={`op2-${pIdx}`}>খ/ Option B</Label>
              <Input
                id={`op2-${pIdx}`}
                placeholder="খ/B"
                type="text"
                value={formData.options[1]}
                onChange={(e) => handleOptionChange(1, e.target.value)}
              />
            </LabelInputContainer>
          </div>
          <div className="flex gap-2">
            <LabelInputContainer className="mb-2 flex-1">
              <Label htmlFor={`op3-${pIdx}`}>গ/Option C</Label>
              <Input
                id={`op3-${pIdx}`}
                placeholder="গ/C"
                type="text"
                value={formData.options[2]}
                onChange={(e) => handleOptionChange(2, e.target.value)}
              />
            </LabelInputContainer>
            <LabelInputContainer className="mb-2 flex-1">
              <Label htmlFor={`op4-${pIdx}`}>ঘ/ Option D</Label>
              <Input
                id={`op4-${pIdx}`}
                placeholder="ঘ/D"
                type="text"
                value={formData.options[3]}
                onChange={(e) => handleOptionChange(3, e.target.value)}
              />
            </LabelInputContainer>
          </div>
        </div>

        <div className="flex justify-between items-center">
          {children}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">নম্বর:</span>
              <span className="bg-white px-3 py-1 rounded border text-sm">1</span>
            </div>
            <div>
              <Select
                value={formData.correctAnswer}
                onValueChange={(value) => handleInputChange("correctAnswer", value)}
              >
                <SelectTrigger className="min-w-[250px] bg-white">
                  <SelectValue placeholder="সঠিক উত্তর (Correct Answer)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">ক/A</SelectItem>
                  <SelectItem value="2">খ/B</SelectItem>
                  <SelectItem value="3">গ/C</SelectItem>
                  <SelectItem value="4">ঘ/D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

// MCQ Template 2 - True/False (2 options)
const MCQTemplet_2 = ({ children, pIdx, mcqTemplet, setMcqTemplet }: Props) => {
  const [formData, setFormData] = useState({
    questionText: "",
    image: "",
    options: ["সত্য", "মিথ্যা"],
    correctAnswer: "",
    marks: 1,
  })

  const isInitialized = useRef(false)
  const lastDataRef = useRef<string>("")

  // Load existing data when component mounts - ONLY ONCE
  useEffect(() => {
    if (!isInitialized.current && mcqTemplet[pIdx] && mcqTemplet[pIdx][0]) {
      const existingData = mcqTemplet[pIdx][0]
      const newFormData = {
        questionText: existingData.questionText || "",
        image: existingData.image || "",
        options: existingData.options || ["সত্য", "মিথ্যা"],
        correctAnswer: existingData.correctAnswer || "",
        marks: existingData.marks || 1,
      }
      setFormData(newFormData)
      isInitialized.current = true
      lastDataRef.current = JSON.stringify(newFormData)
    }
  }, [pIdx])

  useEffect(() => {
    if (isInitialized.current) {
      const currentDataString = JSON.stringify(formData)
      if (currentDataString !== lastDataRef.current) {
        setMcqTemplet((prev) => {
          const newState = [...prev]
          if (newState[pIdx] && newState[pIdx][0]) {
            newState[pIdx][0] = {
              ...newState[pIdx][0],
              ...formData,
            }
          }
          return newState
        })
        lastDataRef.current = currentDataString
      }
    }
  }, [formData, pIdx, setMcqTemplet])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleOptionChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }))
  }

  return (
    <div className="w-full">
      <form className="bg-blue-300 mx-auto max-w-4xl p-3 rounded-2xl mb-2">
        <LabelInputContainer className="mb-2">
          <Label htmlFor={`qStatement-${pIdx}`}>প্রশ্ন (Question)</Label>
          <Input
            id={`qStatement-${pIdx}`}
            placeholder="প্রশ্নটি লিখুন (Write the question)"
            type="text"
            value={formData.questionText}
            onChange={(e) => handleInputChange("questionText", e.target.value)}
          />
        </LabelInputContainer>

        <ImageDropzone
          imgFor={`MCQ2-Question-${pIdx}`}
          image={formData.image}
          onImageChange={(url) => handleInputChange("image", url)}
        />

        <div>
          <div className="flex gap-2">
            <LabelInputContainer className="mb-2 flex-1">
              <Label htmlFor={`op1-${pIdx}`}>ক/ Option A</Label>
              <Input
                id={`op1-${pIdx}`}
                placeholder="সত্য/True"
                type="text"
                value={formData.options[0]}
                onChange={(e) => handleOptionChange(0, e.target.value)}
              />
            </LabelInputContainer>
            <LabelInputContainer className="mb-2 flex-1">
              <Label htmlFor={`op2-${pIdx}`}>খ/ Option B</Label>
              <Input
                id={`op2-${pIdx}`}
                placeholder="মিথ্যা/False"
                type="text"
                value={formData.options[1]}
                onChange={(e) => handleOptionChange(1, e.target.value)}
              />
            </LabelInputContainer>
          </div>
        </div>

        <div className="flex justify-between items-center">
          {children}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">নম্বর:</span>
              <span className="bg-white px-3 py-1 rounded border text-sm">1</span>
            </div>
            <div>
              <Select
                value={formData.correctAnswer}
                onValueChange={(value) => handleInputChange("correctAnswer", value)}
              >
                <SelectTrigger className="min-w-[250px] bg-white">
                  <SelectValue placeholder="সঠিক উত্তর (Correct Answer)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">ক/A</SelectItem>
                  <SelectItem value="2">খ/B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

// MCQ Template 3 - Multiple Completion Based
const MCQTemplet_3 = ({ children, pIdx, mcqTemplet, setMcqTemplet }: Props) => {
  // Helper function
  function getDefaultMCQ3Options(infoItems: string[]) {
    const infoLabels = ["i", "ii", "iii"]
    return [
      [0, 1].map((i) => infoLabels[i]).join(", "),
      [0, 2].map((i) => infoLabels[i]).join(", "),
      [1, 2].map((i) => infoLabels[i]).join(", "),
      [0, 1, 2].map((i) => infoLabels[i]).join(", "),
    ]
  }

  const [formData, setFormData] = useState({
    questionText: "",
    image: "",
    infoItems: ["", "", ""],
    options: getDefaultMCQ3Options(["", "", ""]),
    correctAnswer: "",
    marks: 1,
  })

  const isInitialized = useRef(false)
  const lastDataRef = useRef<string>("")

  // Load existing data when component mounts - ONLY ONCE
  useEffect(() => {
    if (!isInitialized.current && mcqTemplet[pIdx] && mcqTemplet[pIdx][0]) {
      const existingData = mcqTemplet[pIdx][0]
      const newFormData = {
        questionText: existingData.questionText || "",
        image: existingData.image || "",
        infoItems: existingData.infoItems || ["", "", ""],
        options:
          existingData.options && existingData.options.length === 4
            ? existingData.options
            : getDefaultMCQ3Options(existingData.infoItems || ["", "", ""]),
        correctAnswer: existingData.correctAnswer || "",
        marks: existingData.marks || 1,
      }
      setFormData(newFormData)
      isInitialized.current = true
      lastDataRef.current = JSON.stringify(newFormData)
    }
  }, [pIdx])

  // Auto-update options if infoItems change
  useEffect(() => {
    if (
      formData.options.join() === getDefaultMCQ3Options(["", "", ""]).join() ||
      formData.options.some((opt) => !opt.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        options: getDefaultMCQ3Options(prev.infoItems),
      }))
    }
    // eslint-disable-next-line
  }, [formData.infoItems])

  useEffect(() => {
    if (isInitialized.current) {
      const currentDataString = JSON.stringify(formData)
      if (currentDataString !== lastDataRef.current) {
        setMcqTemplet((prev) => {
          const newState = [...prev]
          if (newState[pIdx] && newState[pIdx][0]) {
            newState[pIdx][0] = {
              ...newState[pIdx][0],
              questionText: formData.questionText,
              image: formData.image,
              options: formData.options,
              correctAnswer: formData.correctAnswer,
              marks: formData.marks,
              infoItems: formData.infoItems,
            }
          }
          return newState
        })
        lastDataRef.current = currentDataString
      }
    }
  }, [formData, pIdx, setMcqTemplet])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleInfoChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      infoItems: prev.infoItems.map((item, i) => (i === index ? value : item)),
    }))
  }

  const handleOptionChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }))
  }

  return (
    <div className="w-full">
      <form className="bg-blue-300 mx-auto max-w-4xl p-3 rounded-2xl mb-2">
        <LabelInputContainer className="mb-2">
          <Label htmlFor={`qStatement-${pIdx}`}>প্রশ্ন (Question)</Label>
          <Input
            id={`qStatement-${pIdx}`}
            placeholder="প্রশ্নটি লিখুন (Write the question)"
            type="text"
            value={formData.questionText}
            onChange={(e) => handleInputChange("questionText", e.target.value)}
          />
        </LabelInputContainer>

        <ImageDropzone
          imgFor={`MCQ3-Question-${pIdx}`}
          image={formData.image}
          onImageChange={(url) => handleInputChange("image", url)}
        />

        <div className="mx-4 space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <label htmlFor={`info1-${pIdx}`} className="text-sm font-medium">
              i.
            </label>
            <input
              id={`info1-${pIdx}`}
              type="text"
              placeholder="তথ্য ১ (Info 1)"
              className="bg-white p-2 flex-1 rounded-md border"
              value={formData.infoItems[0]}
              onChange={(e) => handleInfoChange(0, e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor={`info2-${pIdx}`} className="text-sm font-medium">
              ii.
            </label>
            <input
              id={`info2-${pIdx}`}
              type="text"
              placeholder="তথ্য ২ (Info 2)"
              className="bg-white p-2 flex-1 rounded-md border"
              value={formData.infoItems[1]}
              onChange={(e) => handleInfoChange(1, e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor={`info3-${pIdx}`} className="text-sm font-medium">
              iii.
            </label>
            <input
              id={`info3-${pIdx}`}
              type="text"
              placeholder="তথ্য ৩ (Info 3)"
              className="bg-white p-2 flex-1 rounded-md border"
              value={formData.infoItems[2]}
              onChange={(e) => handleInfoChange(2, e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex gap-2">
            <LabelInputContainer className="mb-2 flex-1">
              <Label htmlFor={`op1-${pIdx}`}>ক/ Option A</Label>
              <Input
                id={`op1-${pIdx}`}
                placeholder="i, ii"
                type="text"
                value={formData.options[0]}
                onChange={(e) => handleOptionChange(0, e.target.value)}
              />
            </LabelInputContainer>
            <LabelInputContainer className="mb-2 flex-1">
              <Label htmlFor={`op2-${pIdx}`}>খ/ Option B</Label>
              <Input
                id={`op2-${pIdx}`}
                placeholder="i, iii"
                type="text"
                value={formData.options[1]}
                onChange={(e) => handleOptionChange(1, e.target.value)}
              />
            </LabelInputContainer>
          </div>
          <div className="flex gap-2">
            <LabelInputContainer className="mb-2 flex-1">
              <Label htmlFor={`op3-${pIdx}`}>গ/Option C</Label>
              <Input
                id={`op3-${pIdx}`}
                placeholder="ii, iii"
                type="text"
                value={formData.options[2]}
                onChange={(e) => handleOptionChange(2, e.target.value)}
              />
            </LabelInputContainer>
            <LabelInputContainer className="mb-2 flex-1">
              <Label htmlFor={`op4-${pIdx}`}>ঘ/ Option D</Label>
              <Input
                id={`op4-${pIdx}`}
                placeholder="i, ii, iii"
                type="text"
                value={formData.options[3]}
                onChange={(e) => handleOptionChange(3, e.target.value)}
              />
            </LabelInputContainer>
          </div>
        </div>

        <div className="flex justify-between items-center">
          {children}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">নম্বর:</span>
              <span className="bg-white px-3 py-1 rounded border text-sm">1</span>
            </div>
            <div>
              <Select
                value={formData.correctAnswer}
                onValueChange={(value) => handleInputChange("correctAnswer", value)}
              >
                <SelectTrigger className="min-w-[250px] bg-white">
                  <SelectValue placeholder="সঠিক উত্তর (Correct Answer)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">ক/A</SelectItem>
                  <SelectItem value="2">খ/B</SelectItem>
                  <SelectItem value="3">গ/C</SelectItem>
                  <SelectItem value="4">ঘ/D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

// MCQ Template 4 - Situation Based with Passage and Collapsible Sub-Questions
const MCQTemplet_4 = ({ children, pIdx, setMcqTemplet, mcqTemplet, onDeleteIndividual }: MCQTempletProps) => {
  const [passageData, setPassageData] = useState({
    passage: "",
    passageImage: "",
    subQuestions: [] as any[],
  })
  const [isSubQuestionsOpen, setIsSubQuestionsOpen] = useState(true)

  const isInitialized = useRef(false)
  const lastDataRef = useRef<string>("")

  // Load existing data when component mounts - ONLY ONCE
  useEffect(() => {
    if (!isInitialized.current && mcqTemplet[pIdx] && mcqTemplet[pIdx][0]) {
      const existingData = mcqTemplet[pIdx][0]
      const newPassageData = {
        passage: existingData.passage || "",
        passageImage: existingData.passageImage || "",
        subQuestions: existingData.subQuestions || [],
      }
      setPassageData(newPassageData)
      isInitialized.current = true
      lastDataRef.current = JSON.stringify(newPassageData)
    }
  }, [pIdx])

  // Update parent state for passage data - with loop prevention
  useEffect(() => {
    if (isInitialized.current) {
      const currentDataString = JSON.stringify(passageData)
      if (currentDataString !== lastDataRef.current) {
        setMcqTemplet((prev: any[]) => {
          const newState = [...prev]
          if (newState[pIdx] && newState[pIdx][0]) {
            newState[pIdx][0] = {
              ...newState[pIdx][0],
              passage: passageData.passage,
              passageImage: passageData.passageImage,
              subQuestions: passageData.subQuestions,
            }
          }
          return newState
        })
        lastDataRef.current = currentDataString
      }
    }
  }, [passageData, pIdx, setMcqTemplet])

  const handleAddSubQuestion = () => {
    if (passageData.subQuestions.length >= 3) return // Max 3 sub-questions

    const newSubQuestion = {
      childIdx: passageData.subQuestions.length,
      id: `${Date.now()}-${Math.random()}-${pIdx}-${passageData.subQuestions.length}`,
      questionText: "",
      image: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      marks: 1,
    }

    setPassageData((prev) => ({
      ...prev,
      subQuestions: [...prev.subQuestions, newSubQuestion],
    }))
  }

  const handleDeleteSubQuestion = async (index: number) => {
    const subQuestion = passageData.subQuestions[index]

    // If sub-question has an ID (saved to backend), delete via API
    if (subQuestion._id && onDeleteIndividual) {
      await onDeleteIndividual(subQuestion._id)
    } else {
      // Delete locally if not saved yet
      setPassageData((prev) => ({
        ...prev,
        subQuestions: prev.subQuestions
          .filter((_, i) => i !== index)
          .map((sq, i) => ({
            ...sq,
            childIdx: i,
          })),
      }))
    }
  }

  const handleSubQuestionChange = (index: number, field: string, value: any) => {
    setPassageData((prev) => ({
      ...prev,
      subQuestions: prev.subQuestions.map((sq, i) => (i === index ? { ...sq, [field]: value } : sq)),
    }))
  }

  const handleSubQuestionOptionChange = (subIndex: number, optionIndex: number, value: string) => {
    setPassageData((prev) => ({
      ...prev,
      subQuestions: prev.subQuestions.map((sq, i) =>
        i === subIndex
          ? {
              ...sq,
              options: sq.options.map((opt: string, oi: number) => (oi === optionIndex ? value : opt)),
            }
          : sq,
      ),
    }))
  }

  return (
    <div className="bg-blue-100 max-w-4xl mx-auto p-3 rounded-2xl mb-2">
      <form>
        <LabelInputContainer className="mb-2">
          <Label htmlFor={`passage-${pIdx}`}>উদ্দীপক (Passage)</Label>
          <textarea
            id={`passage-${pIdx}`}
            className="bg-white p-3 rounded-2xl w-full min-h-[100px] border"
            placeholder="উদ্দীপকটি লিখুন (write the passage)"
            value={passageData.passage}
            onChange={(e) => setPassageData((prev) => ({ ...prev, passage: e.target.value }))}
          />
        </LabelInputContainer>

        <ImageDropzone
          imgFor={`MCQ4-Passage-${pIdx}`}
          image={passageData.passageImage}
          onImageChange={(url) => setPassageData((prev) => ({ ...prev, passageImage: url }))}
        />
      </form>

      <div className="mt-4">
        <div className="flex justify-between items-center mb-3">
          <button
            type="button"
            onClick={() => setIsSubQuestionsOpen(!isSubQuestionsOpen)}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition-colors"
          >
            <span className="font-medium">Sub Questions ({passageData.subQuestions.length}/3)</span>
            {isSubQuestionsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            type="button"
            onClick={handleAddSubQuestion}
            disabled={passageData.subQuestions.length >= 3}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add Sub Question
          </button>
        </div>

        {isSubQuestionsOpen && (
          <div className="space-y-3">
            {passageData.subQuestions.map((subQuestion, index) => (
              <div
                key={`subq-${pIdx}-${index}-${subQuestion.id || index}`}
                className="bg-blue-300 p-3 rounded-lg relative"
              >
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleDeleteSubQuestion(index)}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    title="Delete Sub Question"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div className="pr-8">
                  <LabelInputContainer className="mb-2">
                    <Label>
                      প্রশ্ন {index + 1} (Sub Question {index + 1}) 
                    </Label>
                    <Input
                      placeholder="প্রশ্নটি লিখুন"
                      value={subQuestion.questionText}
                      onChange={(e) => handleSubQuestionChange(index, "questionText", e.target.value)}
                    />
                  </LabelInputContainer>

                  <ImageDropzone
                    imgFor={`MCQ4-SubQuestion-${pIdx}-${index}`}
                    image={subQuestion.image}
                    onImageChange={(url) => handleSubQuestionChange(index, "image", url)}
                  />

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <LabelInputContainer>
                      <Label>ক/ Option A</Label>
                      <Input
                        placeholder="ক/A"
                        value={subQuestion.options[0]}
                        onChange={(e) => handleSubQuestionOptionChange(index, 0, e.target.value)}
                      />
                    </LabelInputContainer>
                    <LabelInputContainer>
                      <Label>খ/ Option B</Label>
                      <Input
                        placeholder="খ/B"
                        value={subQuestion.options[1]}
                        onChange={(e) => handleSubQuestionOptionChange(index, 1, e.target.value)}
                      />
                    </LabelInputContainer>
                    <LabelInputContainer>
                      <Label>গ/ Option C</Label>
                      <Input
                        placeholder="গ/C"
                        value={subQuestion.options[2]}
                        onChange={(e) => handleSubQuestionOptionChange(index, 2, e.target.value)}
                      />
                    </LabelInputContainer>
                    <LabelInputContainer>
                      <Label>ঘ/ Option D</Label>
                      <Input
                        placeholder="ঘ/D"
                        value={subQuestion.options[3]}
                        onChange={(e) => handleSubQuestionOptionChange(index, 3, e.target.value)}
                      />
                    </LabelInputContainer>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">নম্বর:</span>
                      <span className="bg-white px-3 py-1 rounded border text-sm">1</span>
                    </div>
                    <Select
                      value={subQuestion.correctAnswer}
                      onValueChange={(value) => handleSubQuestionChange(index, "correctAnswer", value)}
                    >
                      <SelectTrigger className="w-48 bg-white">
                        <SelectValue placeholder="সঠিক উত্তর" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">ক/A</SelectItem>
                        <SelectItem value="2">খ/B</SelectItem>
                        <SelectItem value="3">গ/C</SelectItem>
                        <SelectItem value="4">ঘ/D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
            {passageData.subQuestions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No sub-questions added yet. Click "Add Sub Question" to start.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-4">{children}</div>
    </div>
  )
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return <div className={cn("flex w-full flex-col space-y-2", className)}>{children}</div>
}

const DelBtn = ({
  pIdx,
  setMcqTemplet,
  mcqTemplet,
  onDeleteIndividual,
  mcqId,
  deleteType = "group",
}: Omit<Props, "children"> & {
  mcqId?: string
  deleteType?: "group" | "individual"
}) => {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (deleteType === "individual" && mcqId && onDeleteIndividual) {
      await onDeleteIndividual(mcqId)
    } else {
      setMcqTemplet((prev) => {
        return prev.filter((_, index) => index !== pIdx)
      })
    }
  }

  return (
    <button
      className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-2 text-sm rounded-xl transition-colors"
      onClick={handleDelete}
    >
      {deleteType === "individual" ? "Delete MCQ" : "Delete MCQ"}
    </button>
  )
}

export { MCQTemplet_1, MCQTemplet_2, MCQTemplet_3, MCQTemplet_4, LabelInputContainer, DelBtn }
