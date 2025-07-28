import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"
import Link from "next/link"


export function QuestionMenubar() {
  return (
    <Menubar className=" justify-between fixed w-full top-[40px] z-10">
      <p className="text-xl">
        Exam Editor
      </p>

      <div className="flex gap-4">
        <MenubarMenu>
          <button className=" hover:bg-white p-3">Equation & Symbol</button>
        </MenubarMenu>
        <MenubarMenu>
          <button className=" hover:bg-white p-3">Table</button>
        </MenubarMenu>
      </div>
      <div>
        Question left:
      </div>
    </Menubar>
  )
}
