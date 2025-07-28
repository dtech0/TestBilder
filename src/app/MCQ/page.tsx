
// "use client"

// import { useRef } from "react"
// import { useSearchParams } from "next/navigation"

// export default function IframeMCQ() {
//   const iframeRef = useRef<HTMLIFrameElement>(null)
//   const searchParams = useSearchParams()
//   const templateId = searchParams.get("templateId")

//   const handlePrint = () => {
//     if (iframeRef.current && iframeRef.current.contentWindow) {
//       iframeRef.current.contentWindow.print()
//     }
//   }

//   if (!templateId) {
//     return <div className="text-red-600 text-center mt-10">Template ID missing!</div>
//   }

//   return (
//     <div className="w-full justify-items-center">
//       <div>
//         <iframe ref={iframeRef} src={`/demoMCQ/MCQ/mcq.html?templateId=${templateId}`} width="835" height="750" />
//       </div>
//       <div className="">
//         <button
//           onClick={handlePrint}
//           className="fixed z-100 bg-black text-white py-1 w-[100px] font-bold rounded-xl hover:bg-blue-700 bottom-10 mx-[-50px]"
//         >
//           Print
//         </button>
//       </div>
//     </div>
//   )
// }


"use client"

import { useRef } from "react"
import { useSearchParams } from "next/navigation"

export default function MCQPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const searchParams = useSearchParams()
  const templateId = searchParams.get("templateId")

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.print()
    }
  }

  if (!templateId) {
    return <div className="text-red-600 text-center mt-10">Template ID missing!</div>
  }

  return (
    <div className="w-full justify-items-center">
      <div>
        <iframe ref={iframeRef} src={`/demoMCQ/MCQ/mcq.html?templateId=${templateId}`} width="835" height="750" />
      </div>
      <div className="">
        <button
          onClick={handlePrint}
          className="fixed z-100 bg-black text-white py-1 w-[100px] font-bold rounded-xl hover:bg-blue-700 bottom-10 mx-[-50px]"
        >
          Print
        </button>
      </div>
    </div>
  )
}
