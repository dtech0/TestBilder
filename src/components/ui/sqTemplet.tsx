

"use client"

import type React from "react"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import ImageDropzone from "@/components/ImageDropzone"

type DelBtnProps = {
  pIdx: number
  onDelete: () => void
}

export const DelBtnSQ = ({ onDelete }: DelBtnProps) => (
  <button
    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-2 text-sm rounded-xl"
    onClick={onDelete}
    type="button"
  >
    Delete SQ
  </button>
)

type SqTempletProps = {
  id: string
  value: string
  marks?: number
  image?: string
   index: number 
  onImageChange: (imgPath: string) => void
  onChange: (value: string) => void
  children: React.ReactNode
}

export const SqTemplet = ({ id,index, value, marks = 2, image, onImageChange, onChange, children }: SqTempletProps) => {
  const handleImageChange = (url: string) => {
    console.log(`SQ Image updated for question ${id}:`, url)
    onImageChange(url)
  }

  return (
    <div className="mx-auto max-w-2xl p-3 bg-blue-100 rounded-2xl">
      <div className="flex justify-between">
        <div className="w-full">
          <Label htmlFor={`question-input-${id}`}>প্রশ্ন (Question)</Label>
          <Input
            id={`question-input-${id}`}
            placeholder="প্রশ্ন লিখুন (Write question)"
            type="text"
            className="w-full"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`marks-input-${id}`}>নম্বর (Marks)</Label>
          <Input
            id={`marks-input-${id}`}
            placeholder="নম্বর"
            type="number"
            className="w-20"
            defaultValue={marks}
            readOnly
          />
        </div>
      </div>
      <ImageDropzone imgFor={`SQ-Question-${index + 1}`} image={image} onImageChange={handleImageChange} />
      <div className="flex justify-end mt-2">{children}</div>
    </div>
  )
}
