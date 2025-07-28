


"use client"

import { useState, useRef, useEffect } from "react"

type Props = {
  imgFor: string
  image?: string
  onImageChange: (imgPath: string) => void
}

export default function ImageDropzone({ imgFor, image, onImageChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (image && image !== preview) {
      setPreview(image)
    }
  }, [image])

  const handleUpload = async (file: File) => {
    setUploading(true)
    const formData = new FormData()
    formData.append("image", file)

    try {
      const res = await fetch("/Api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (data.success) {
        const imageUrl = data.fileUrl
        console.log(`Image uploaded for ${imgFor}:`, imageUrl)
        setPreview(imageUrl)
        onImageChange(imageUrl)
      } else {
        alert("Image upload failed: " + data.error)
      }
    } catch (err) {
      console.error("Upload error:", err)
      alert("Something went wrong during image upload.")
    } finally {
      setUploading(false)
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0]
    if (file && file.type.startsWith("image/")) {
      handleUpload(file)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onImageChange("")
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col items-center w-full my-2">
      <label
        htmlFor={`file-input-${imgFor}`}
        className="items-center max-w-md border-4 border-dashed border-gray-400 rounded-lg cursor-pointer px-4 py-2 hover:border-gray-600 transition-colors"
      >
        <p className="text-sm text-black bg-amber-50 p-1 rounded">
          {preview ? `Change ${imgFor} IMG` : `${imgFor} IMG (up to 5 MB)`}
        </p>
      </label>

      <input
        id={`file-input-${imgFor}`}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {uploading && (
        <div className="flex items-center gap-2 mt-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">Uploading...</p>
        </div>
      )}

      {preview && (
        <div className="relative mt-2">
          <img
            src={preview || "/placeholder.svg"}
            alt={`Preview for ${imgFor}`}
            className="max-w-md max-h-60 rounded-md border shadow-sm"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold transition-colors"
            type="button"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
