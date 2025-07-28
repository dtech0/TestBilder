const superArray = []
const templet = `
  <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  <span>
    <div class="parent" id="parent1">
      <div class="headerPage1">
        <table style="width: 100%; font-size: 12px;">
          <tr style="height: 80px;">
            <td colspan="3" class="institutionName" style="text-align: center; font-size: 28px;"></td>
          </tr>
          <tr>
            <td style="text-align: left; width: 33.33%;"><b>পরীক্ষাঃ </b><span class="examName"></span></td>
            <td style="text-align: left; width: 33.33%;"><b>বিষয়ঃ </b><span class="subject"></span><span class="paper"></span></td>
            <td style="text-align: left; width: 33.33%;"><b>শ্রেণীঃ </b><span class="class"></span></td>
          </tr>
          <tr>
            <td style="text-align: left;"><b>বিষয় কোডঃ </b><span class="subjectCode"></span></td>
            <td style="text-align: left;"><b>পূর্ণমানঃ </b><span class="totalMark"></span></td>
            <td style="text-align: left;"><b>সময়ঃ </b><span class="totalTime"></span></td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: left;"><b>বিঃদ্রঃ</b> উত্তরপত্রে ক্রমিক নম্বরের বিপরীতে সর্বমোট প্রশ্ন লিখো। প্রতিটি প্রশ্নের ডান পাশে মান সংযুক্ত রয়েছে।</td>
          </tr>
        </table>
      </div>
      <div class="qPage1-Left" id="page1Left"></div>
      <div class="qPage1-Right" id="page1Right"></div>
    </div>
    <div class="parent" id="parent2">
      <div class="headerPage2" style="text-align: center; margin: 0; font-size: 12px;"></div>
      <div class="qPage2-Left" id="page2Left"></div>
      <div class="qPage2-Right" id="page2Right">
        <div id="test" style="width: 375px;"></div>
      </div>
    </div>
  </span>
`

let loopControl = true
let mainArray = []
const maxHeight = 3500

let containerFontSize = 16
let paddingBottomSize = 8
let imgHeight = 100
let imgBool = false

const minFontSize = 10
const minPaddingBottomSize = 3
const minImgHeight = 80

function infiniteCQ(cqData, cqMeta) {
  console.log("infiniteCQ called with:", { cqDataLength: cqData?.length, cqMeta })

  if (!cqData || !Array.isArray(cqData) || cqData.length === 0) {
    console.error("Invalid cqData provided to infiniteCQ")
    return
  }

  document.body.innerHTML = templet
  const allContainer = document.getElementById("test")

  function buildContent() {
    allContainer.innerHTML = ""
    mainArray = []
    allContainer.style.fontSize = `${containerFontSize}px`

    cqData.forEach((item, idx) => {
      const passage = item.questions?.[0]?.questionText || ""
      const passageImg = item.questions?.[0]?.passageImage || ""

      if (passage) {
        allContainer.innerHTML += `<div id="question" style="text-align: justify;"><b id="qNo">${idx + 1}&#46;</b> <span id="qStatement">${passage}</span></div>`
        mainArray.push(
          `<div id="question" style="text-align: justify;"><b id="qNo">${idx + 1}&#46;</b> <span id="qStatement">${passage}</span></div>`,
        )
      }

      if (passageImg) {
        allContainer.innerHTML += `<div style="width: 100%; text-align: center;"><img src="${passageImg}" alt="Image missing" height="${imgHeight}px"></div>`
        mainArray.push(
          `<div style="width: 100%; text-align: center;"><img src="${passageImg}" alt="Image missing" height="${imgHeight}px"></div>`,
        )
      }

      allContainer.innerHTML += `<div style="padding-bottom: ${paddingBottomSize}px;padding-left: 5px;" id="questionContainer${idx}"></div>`

      const subQuestions = item.questions?.[0]?.subQuestions || []
      subQuestions.forEach((sq, qIdx) => {
        const char = "ক"
        const asciiValue = char.charCodeAt(0)

        const questionContainer = document.getElementById(`questionContainer${idx}`)
        if (questionContainer) {
          questionContainer.innerHTML += `
            <div style="width: 100%; text-align: justify;">
              <div style="width: fit-content;">
                <b>${String.fromCharCode(asciiValue + qIdx)}&#41;</b>
                <span id="question${idx}${qIdx}">${sq.questionText || ""}</span>
                <span style="float: right; font-weight: bold;">[${sq.marks || 1}]</span>
              </div>
            </div>
          `

          mainArray.push(
            `<div style="text-align: justify;"><b>${String.fromCharCode(asciiValue + qIdx)}&#41;</b> <span>${sq.questionText || ""}</span><span style="float: right; font-weight: bold;">[${sq.marks || 1}]</span></div>`,
          )

          if (sq.image) {
            questionContainer.innerHTML += `
              <div style="width: 100%; height:${imgHeight}px; text-align: center;">
                <img src="${sq.image}" alt="Image missing" height="${imgHeight}px">
              </div>
            `
            mainArray.push(
              `<div style="width: 100%; height:${imgHeight}px; text-align: center;"><img src="${sq.image}" alt="Image missing" height="${imgHeight}px"></div>`,
            )
          }
        }
      })

      mainArray.push(`<div style="padding-bottom: ${paddingBottomSize}px;padding-left: 5px;"></div>`)
    })
  }

  function shuffleArray(array) {
    return [...array].sort(() => Math.random() - 0.5)
  }

  const shuffledCqData = shuffleArray(cqData)
  let flag = true
  let font = false

  buildContent()

  if (window.MathJax) {
    window.MathJax.typesetPromise([allContainer]).then(() => {})
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
      alert("Content is too large for the page. Please consider reducing question length.")
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
    buildContent()

    if (window.MathJax) {
      window.MathJax.typesetPromise([allContainer]).then(() => {})
    }

    console.log(
      `Height: ${allContainer.offsetHeight}, paddingBS: ${paddingBottomSize}, containerFS: ${containerFontSize}, imgH: ${imgHeight}`,
    )
  }

  loopControl = false
  buildContent()

  if (window.MathJax) {
    window.MathJax.typesetPromise([allContainer]).then(() => {})
  }

  console.log("Final height:", allContainer.offsetHeight)

  const portion = [
    { idName: "page1Left", size: 840, state: true },
    { idName: "page1Right", size: 840, state: true },
    { idName: "page2Left", size: 970, state: true },
    { idName: "page2Right", size: 970, state: true },
  ]

  const itemContainer = document.getElementById("test")
  mainArray.forEach((item) => {
    itemContainer.innerHTML = item

    if (window.MathJax) {
      window.MathJax.typesetPromise([itemContainer]).then(() => {})
    }

    const itemHeight = itemContainer.offsetHeight
    itemContainer.innerHTML = ""

    for (let i = 0; i < portion.length; i++) {
      if (portion[i].size >= itemHeight && portion[i].state) {
        document.getElementById(portion[i].idName).innerHTML += item
        portion[i].size -= itemHeight
        if (i > 0) portion[i - 1].state = false
        break
      }
    }
  })

  document.getElementById("parent1").style.fontSize = `${containerFontSize}px`
  document.getElementById("parent2").style.fontSize = `${containerFontSize}px`

  document.querySelectorAll(".institutionName").forEach((el) => {
    el.textContent = cqMeta.institutionName || ""
  })
  document.querySelectorAll(".examName").forEach((el) => {
    el.textContent = cqMeta.examName || ""
  })
  document.querySelectorAll(".subject").forEach((el) => {
    el.textContent = cqMeta.subject || ""
  })
  document.querySelectorAll(".paper").forEach((el) => {
    el.textContent = cqMeta.paper ? ` (${cqMeta.paper})` : ""
  })
  document.querySelectorAll(".class").forEach((el) => {
    el.textContent = cqMeta.className || ""
  })
  document.querySelectorAll(".subjectCode").forEach((el) => {
    el.textContent = cqMeta.subjectCode || ""
  })
  document.querySelectorAll(".totalMark").forEach((el) => {
    el.textContent = cqMeta.totalMark || ""
  })
  document.querySelectorAll(".totalTime").forEach((el) => {
    el.textContent = cqMeta.totalTime || ""
  })
  document.querySelectorAll(".headerPage2").forEach((el) => {
    el.textContent = cqMeta.message || ""
  })

  superArray.push(document.body.innerHTML)
}

function renderCQ(cqMeta, cqData) {
  console.log("renderCQ called with:", { cqMeta, cqDataLength: cqData?.length })

  if (!cqData || !cqMeta) {
    console.error("Missing data in renderCQ")
    document.body.innerHTML =
      "<div style='text-align: center; margin-top: 50px; font-size: 18px; color: red;'>Error: Missing CQ data or metadata</div>"
    return
  }

  if (!Array.isArray(cqData) || cqData.length === 0) {
    console.error("Invalid cqData array")
    document.body.innerHTML =
      "<div style='text-align: center; margin-top: 50px; font-size: 18px; color: red;'>Error: No CQ questions found</div>"
    return
  }

  const copy = 3
  for (let i = 0; i < copy; i++) {
    infiniteCQ(cqData, cqMeta)
  }

  document.body.innerHTML = ""
  for (let i = 0; i < copy; i++) {
    document.body.innerHTML += superArray[i]
  }

  console.log("CQ rendering completed")
}

window.renderCQ = renderCQ

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, checking for data...")
  if (window.cqData && window.cqMeta) {
    console.log("Data available, rendering...")
    renderCQ(window.cqMeta, window.cqData)
  } else {
    console.log("Data not yet available, waiting...")
  }
})

setTimeout(() => {
  if (window.cqData && window.cqMeta && document.body.innerHTML.trim() === "") {
    console.log("Fallback render triggered")
    renderCQ(window.cqMeta, window.cqData)
  }
}, 2000)
