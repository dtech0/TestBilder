
const templet = `
  <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  <span>
    <div class="parent" id="parent1">
      <div class="headerPage1">
        <table style="width: 100%; font-size: 12px;">
          <tr style="height: 40px;">
            <td colspan="3" class="institutionName" style="text-align: center; font-size: 22px;"></td>
          </tr>
          <tr>
            <td style="text-align: left; width: 33.33%;"><b>পরীক্ষাঃ </b><span class="examName"></span></td>
            <td style="text-align: left; width: 33.33%;"><b>বিষয়ঃ </b><span class="subject"> </span><span class="paper"></span></td>
            <td style="text-align: left; width: 33.33%;"><b>শ্রেণীঃ </b><span class="class"></span></td>
          </tr>
          <tr>
            <td style="text-align: left;"><b>বিষয় কোডঃ </b><span class="subjectCode"></span></td>
            <td style="text-align: left;"><b>পূর্ণমানঃ </b><span class="totalMark"></span></td>
            <td style="text-align: left;"><b>সময়ঃ </b><span class="totalTime"></span></td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: left;"><b>বিঃদ্রঃ</b> উত্তরপত্রে ক্রমিক নম্বরের বিপরীতে উত্তর লিখো। প্রতিটি প্রশ্নের মান ডান পাশে সংযুক্ত রয়েছে। </td>
          </tr>
        </table>
      </div>
      <div class="qPage1" id="page1">
      </div>
    </div>
    <div class="parent" id="parent2">
      <div class="headerPage2" style="text-align: center; margin: 0; font-size: 12px;">
      </div>
      <div class="qPage2" id="page2">
        <div id="test"></div>
      </div>
    </div>
  </span>
`

let loopControl = true
let mainArray = []
const maxHeight = 1200

let containerFontSize = 16
let paddingBottomSize = 8
let imgHeight = 100
let imgBool = false

const minFontSize = 10
const minPaddingBottomSize = 3
const minImgHeight = 80

window.infiniteSQ = async (sqData, sqMeta, currentSetIndex) => {
  document.body.innerHTML = templet
  const allContainer = document.getElementById("test")

  loopControl = true
  containerFontSize = 16
  paddingBottomSize = 8
  imgHeight = 100
  imgBool = false

  async function buildContent() {
    allContainer.innerHTML = ""
    mainArray = []
    allContainer.style.fontSize = `${containerFontSize}px`

    sqData.forEach((item, idx) => {
      allContainer.innerHTML += `<div id="questionContainer${idx}"></div>`
      document.getElementById(`questionContainer${idx}`).innerHTML += `
        <div style="width: 100%; text-align: justify;">
          <div style="width: fit-content;">
            <b>${idx + 1}&#41;</b> 
            <span id="question${idx}${idx}">${item.question}</span>
            ${item.marks ? `<span style="float: right; font-weight: bold;">[${item.marks}]</span>` : ""}
          </div>
        </div>
      `
      mainArray.push(`
        <div style="text-align: justify;">
          <b>${idx + 1}&#41;</b> 
          <span id="question${idx}${idx}">${item.question}</span>
          ${item.marks ? `<span style="float: right; font-weight: bold;">[${item.marks}]</span>` : ""}
        </div>
      `)

      if (item.questionImgSrc) {
        document.getElementById(`questionContainer${idx}`).innerHTML += `
          <div style="width: 100%; height:${imgHeight}px; text-align: center;">
            <img src="${item.questionImgSrc}" alt="Image missing" height="${imgHeight}px">
          </div>
        `
        mainArray.push(
          `<div style="width: 100%; height:${imgHeight}px; text-align: center;"><img src="${item.questionImgSrc}" alt="Image missing" height="${imgHeight}px"></div>`,
        )
      }
      mainArray.push(`<div style="padding-bottom: ${paddingBottomSize}px;"></div>`)
    })
  }

  let flag = true
  let font = false

  await buildContent()

  if (window.MathJax) {
    await window.MathJax.typesetPromise([allContainer])
  }

  while ((allContainer.offsetHeight > maxHeight || flag) && loopControl) {
    if (paddingBottomSize <= minPaddingBottomSize) {
      font = true
    }
    if (imgHeight <= minImgHeight) {
      imgBool = false
    }
    if (paddingBottomSize <= minPaddingBottomSize && containerFontSize <= minFontSize) {
      imgBool = true
    }
    if (paddingBottomSize <= minPaddingBottomSize && containerFontSize <= minFontSize && imgHeight <= minImgHeight) {
      console.log("All minimums reached, breaking loop")
      alert("Dear sir, please consider some small question and option as these are not adjustable for A5 paper")
      break
    }
    if (imgBool) {
      imgHeight--
    } else {
      if (font) {
        containerFontSize--
        font = !font
      } else {
        paddingBottomSize--
        font = !font
      }
    }
    flag = false
    await buildContent()
    if (window.MathJax) {
      await window.MathJax.typesetPromise([allContainer])
    }
    console.log(
      `Height: ${allContainer.offsetHeight}, paddingBS: ${paddingBottomSize}, containerFS: ${containerFontSize}, imgH: ${imgHeight}`,
    )
  }

  loopControl = false
  await buildContent()

  if (window.MathJax) {
    await window.MathJax.typesetPromise([allContainer])
  }
  console.log("Final height:", allContainer.offsetHeight)

  const portion = [
    { idName: "page1", size: 590, state: true, content: [] },
    { idName: "page2", size: 710, state: true, content: [] },
  ]

  const tempDiv = document.createElement("div")
  tempDiv.style.fontSize = `${containerFontSize}px`
  tempDiv.style.visibility = "hidden"
  tempDiv.style.position = "absolute"
  document.body.appendChild(tempDiv)

  for (const itemHtml of mainArray) {
    tempDiv.innerHTML = itemHtml
    if (window.MathJax) {
      await window.MathJax.typesetPromise([tempDiv])
    }
    const itemHeight = tempDiv.offsetHeight

    let placed = false
    for (let i = 0; i < portion.length; i++) {
      if (portion[i].size >= itemHeight && portion[i].state) {
        portion[i].content.push(itemHtml)
        portion[i].size -= itemHeight
        if (i > 0) portion[i - 1].state = false
        placed = true
        break
      }
    }
    if (!placed) {
      console.warn("Item could not be placed in any column:", itemHtml)
    }
  }
  document.body.removeChild(tempDiv)

  portion.forEach((p) => {
    const targetElement = document.getElementById(p.idName)
    if (targetElement) {
      targetElement.innerHTML = p.content.join("")
    }
  })

  document.getElementById("parent1").style.fontSize = `${containerFontSize}px`
  document.getElementById("parent2").style.fontSize = `${containerFontSize}px`
  document.querySelectorAll(".institutionName").forEach((el) => {
    el.innerHTML = sqMeta.institutionName
  })
  document.querySelectorAll(".examName").forEach((el) => {
    el.textContent = sqMeta.examName
  })
  document.querySelectorAll(".subject").forEach((el) => {
    el.textContent = sqMeta.subject
  })
  document.querySelectorAll(".paper").forEach((el) => {
    el.textContent = sqMeta.paper
  })
  document.querySelectorAll(".class").forEach((el) => {
    el.textContent = sqMeta.className
  })
  document.querySelectorAll(".subjectCode").forEach((el) => {
    el.textContent = sqMeta.subjectCode
  })
  document.querySelectorAll(".totalMark").forEach((el) => {
    el.textContent = sqMeta.totalMark
  })
  document.querySelectorAll(".totalTime").forEach((el) => {
    el.textContent = sqMeta.totalTime
  })
  document.querySelectorAll(".headerPage2").forEach((el) => {
    el.textContent = sqMeta.message
  })

  if (window.MathJax) {
    await window.MathJax.typesetPromise(
      [document.getElementById("page1"), document.getElementById("page2")].filter(Boolean),
    )
  }
}
