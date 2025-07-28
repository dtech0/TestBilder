import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SelectLabel } from "@radix-ui/react-select"
export function MCQ() {
  return (
    <div className=" justify-between fixed w-full  top-[100px] z-10">
      <div className=" justify-between flex bg-gray-100 p-2 rounded-2xl max-w-200 m-auto">
        <div>
          <Select>
            <SelectTrigger className=" min-w-[380px] bg-white">
              <SelectValue placeholder="Select MCQ type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mcq-1">সাধারণ বহুনির্বাচনী (Standard Multiple Choice Question) </SelectItem>
              <SelectItem value="mcq-2">সত্য/মিথ্যা (True/False) </SelectItem>
              <SelectItem value="mcq-3">বহুপদী ও সমাপ্তিসূচক (Multiple Completion Based Question) </SelectItem>
              <SelectItem value="mcq-4">অভিন্ন তথ্যভিত্তিক (Situation Set Based Question)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <button className="px-6 mx-3 hover:bg-blue-700 py-1 text-white rounded-xl bg-black">Add</button>
        </div>
      </div>
    </div>

  )
}
