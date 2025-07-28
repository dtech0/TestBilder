

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
            <td style="text-align: left;"><b>সেটঃ </b><span class="setCode"></span></td>
            <td style="text-align: left;"><b>পূর্ণমানঃ </b><span class="totalMark"></span></td>
            <td style="text-align: left;"><b>সময়ঃ </b><span class="totalTime"></span></td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: left;"><b>বিঃদ্রঃ</b> সংযুক্ত উত্তরপত্রে ক্রমিক নম্বরের বিপরীতে সঠিক/ সর্বোত্তম উত্তর বল পয়েন্ট কলম দিয়ে পূরণ করো। প্রতিটি প্রশ্নের মান ১।</td>
          </tr>
        </table>
      </div>
      <div class="qPage1-Left" id="page1Left"></div>
      <div class="qPage1-Right" id="page1Right"></div>
      <div class="omrFront">
        <br>
        <img src="omr-1.png" width="100%" style="max-width: 770px;" alt="omrImg">
        <table style="width: 420px; font-size: 12px; transform: rotate(90deg); z-index: 1000; margin-left: 480px; position: relative; top: -270px">
          <tr style="height: 80px;">
            <td colspan="3" class="institutionName" style="text-align: center; font-size: 20px;"></td>
          </tr>
          <tr>
            <td style="text-align: left; width: 33.33%;"><b>পরীক্ষাঃ </b><span class="examName"></span></td>
            <td style="text-align: left; width: 33.33%;"><b>বিষয়ঃ </b><span class="subject"></span><span class="paper"></span></td>
            <td style="text-align: left; width: 33.33%;"><b>শ্রেণীঃ </b><span class="class"></span></td>
          </tr>
          <tr>
            <td style="text-align: left;"><b>সেটঃ </b><span class="setCode"></span></td>
            <td style="text-align: left;"><b>পূর্ণমানঃ </b><span class="totalMark"></span></td>
            <td style="text-align: left;"><b>সময়ঃ </b><span class="totalTime"></span></td>
          </tr>
        </table>
      </div>
    </div>
    <div class="parent" id="parent2">
      <div class="headerPage2" style="text-align: center; margin: 0; font-size: 12px;"></div>
      <div class="qPage2-Left" id="page2Left"></div>
      <div class="qPage2-Right" id="page2Right">
        <div id="test" style="width: 375px;"></div>
      </div>
      <div class="omrBack">
        <img style="margin-left: 60%; transform: translateX(-50%);" src="instructionForOMR.png" height="420px" alt="omrInstruction">
      </div>
    </div>
  </span>
`
let loopControl = true
const setOption = ["পদ্মা", "মেঘনা", "যমুনা", "মাতামুহুরি", "হালদা"]
let mainArray = []
const maxHeight = 2700

let containerFontSize = 16
let paddingBottomSize = 5
let imgHeight = 90

let imgBool = false

const minFontSize = 10
const minPaddingBottomSize = 0
const minImgHeight = 80

window.infiniteMCQ = async (mcqData, mcqMeta, currentSetIndex) => {
  document.body.innerHTML = templet
  const allContainer = document.getElementById("test")

  loopControl = true
  containerFontSize = 16
  paddingBottomSize = 5
  imgHeight = 90
  imgBool = false

  async function buildContent() {
    let questionCount = 1
    mainArray = []
    allContainer.innerHTML = ""
    allContainer.style.fontSize = `${containerFontSize}px`

    for (const item of mcqData) {
      if (item.mcqHeader) {
        allContainer.innerHTML += `<div><span id="qStatement"><b>${item.mcqHeader}</b></span></div>`
        mainArray.push(`<div><span id="qStatement"><b>${item.mcqHeader}</b></span></div>`)
      }
      if (item.passage) {
        allContainer.innerHTML += `<div>${item.passage}</div>`
        mainArray.push(`<div>${item.passage}</div>`)
      }
      if (item.passageImgSrc) {
        allContainer.innerHTML += `
          <div style="width: 100%; text-align: center;">
            <img src="${item.passageImgSrc}" alt="Image missing" height="${imgHeight}px">
          </div>
        `
        mainArray.push(
          `<div style="width: 100%; text-align: center;"><img src="${item.passageImgSrc}" alt="Image missing" height="${imgHeight}px"></div>`,
        )
      }
      const questionArray = item.questions
      for (const ques of questionArray) {
        if (ques.question) {
          
          allContainer.innerHTML += `<div id="question"><b>${questionCount}&#46;</b> <span id="qStatement">${ques.question}</span></div>`
          mainArray.push(
            `<div id="question"><b>${questionCount}&#46;</b> <span id="qStatement">${ques.question}</span></div>`,
          )
          if (ques.questionImgSrc) {
            allContainer.innerHTML += `
              <div style="width: 100%; text-align: center;">
                <img src="${ques.questionImgSrc}" alt="Image missing" height="${imgHeight}px">
              </div>
            `
            mainArray.push(
              `<div style="width: 100%; text-align: center;"><img src="${ques.questionImgSrc}" alt="Image missing" height="${imgHeight}px"></div>`,
            )
          }

          allContainer.innerHTML += `<div style="width: fit-content;" id="optionSize"></div>`
          const opDiv = document.getElementById("optionSize")
          const optionArray = ques.mcqOptions
          const optLabel = ["a", "b", "c", "d"]
          let opMaxLength = 0
          for (let optIdx = 0; optIdx < optionArray.length; optIdx++) {
            const opt = optionArray[optIdx]
            opDiv.innerHTML = `<b>${optLabel[optIdx]}&#41;</b> <span>${opt}</span>`
            if (window.MathJax) {
              await window.MathJax.typesetPromise([opDiv])
            }
            if (opDiv && opMaxLength < opDiv.offsetWidth) opMaxLength = opDiv.offsetWidth
            opDiv.innerHTML = ``
          }

          if (opMaxLength < 90) {
            allContainer.innerHTML += `
            <div style="display: flex; justify-content: space-between; padding-left: 5px;">
              <div style="width: 25%;" id="op1"><div id="id-op1${item.mcqId}" style="width: fit-content;"><b>a&#41;</b> <span id="op1Statement">${optionArray[0]}</span></div></div>
              <div style="width: 25%;" id="op2"><div id="id-op2${item.mcqId}" style="width: fit-content;"><b>b&#41;</b> <span id="op2Statement">${optionArray[1]}</span></div></div>
              <div style="width: 25%;" id="op3"><div id="id-op3${item.mcqId}" style="width: fit-content;"><b>c&#41;</b> <span id="op3Statement">${optionArray[2]}</span></div></div>
              <div style="width: 25%;" id="op4"><div id="id-op4${item.mcqId}" style="width: fit-content;"><b>d&#41;</b> <span id="op4Statement">${optionArray[3]}</span></div></div>
            </div>`
            mainArray.push(
              `<div style="display: flex; justify-content: space-between;align-items: center; padding-left: 5px;padding-bottom: ${paddingBottomSize}px;"><div style="width: 25%;" id="op1"><div id="id-op1${item.mcqId}" style="width: fit-content;"><b>a&#41;</b> <span id="op1Statement">${optionArray[0]}</span></div></div><div style="width: 25%;" id="op2"><div id="id-op2${item.mcqId}" style="width: fit-content;"><b>b&#41;</b> <span id="op2Statement">${optionArray[1]}</span></div></div><div style="width: 25%;" id="op3"><div id="id-op3${item.mcqId}" style="width: fit-content;"><b>c&#41;</b> <span id="op3Statement">${optionArray[2]}</span></div></div><div style="width: 25%;" id="op4"><div id="id-op4${item.mcqId}" style="width: fit-content;"><b>d&#41;</b> <span id="op4Statement">${optionArray[3]}</span></div></div></div>`,
            )
          }
          else if (opMaxLength < 184) {
            allContainer.innerHTML += `
              <div style="padding-left: 5px;">
                <div style="display: flex; justify-content: space-between;">
                  <div style="width: 50%;" id="op1"><div id="id-op1${item.mcqId}" style="width: fit-content;"><b>a&#41;</b> <span id="op1Statement">${optionArray[0]}</span></div></div>
                  <div style="width: 50%;" id="op2"><div id="id-op2${item.mcqId}" style="width: fit-content;"><b>b&#41;</b> <span id="op2Statement">${optionArray[1]}</span></div></div>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <div style="width: 50%;" id="op3"><div id="id-op3${item.mcqId}" style="width: fit-content;"><b>c&#41;</b> <span id="op3Statement">${optionArray[2]}</span></div></div>
                  <div style="width: 50%;" id="op4"><div id="id-op4${item.mcqId}" style="width: fit-content;"><b>d&#41;</b> <span id="op4Statement">${optionArray[3]}</span></div></div>
                </div>  
              </div>
            `
            mainArray.push(
              `<div style="padding-left: 5px;"><div style="align-items: center; display: flex; justify-content: space-between;"><div style="width: 50%;" id="op1"><div id="id-op1${item.mcqId}" style="width: fit-content;"><b>a&#41;</b> <span id="op1Statement">${optionArray[0]}</span></div></div "><div style="width: 50%;" id="op2"><div id="id-op2${item.mcqId}" style="width: fit-content;"><b>b&#41;</b> <span id="op2Statement">${optionArray[1]}</span></div></div></div></div>`,
            )
            mainArray.push(
              `<div style="padding-left: 5px;padding-bottom: ${paddingBottomSize}px;"><div style="align-items: center;display: flex; justify-content: space-between;"><div style="width: 50%;" id="op3"><div id="id-op3${item.mcqId}" style="width: fit-content;"><b>c&#41;</b> <span id="op3Statement">${optionArray[2]}</span></div></div><div style="width: 50%;" id="op4"><div id="id-op4${item.mcqId}" style="width: fit-content;"><b>d&#41;</b> <span id="op4Statement">${optionArray[3]}</span></div></div></div></div>`,
            )
          }
          else {
            allContainer.innerHTML += `
              <div style="padding-left: 5px;">
                <div style="width: 100%;" id="op1"><div id="id-op1${item.mcqId}" style="width: fit-content;"><b>a&#41;</b> <span id="op1Statement">${optionArray[0]}</span></div></div>
                <div style="width: 100%;" id="op2"><div id="id-op2${item.mcqId}" style="width: fit-content;"><b>b&#41;</b> <span id="op2Statement">${optionArray[1]}</span></div></div>
                <div style="width: 100%;" id="op3"><div id="id-op3${item.mcqId}" style="width: fit-content;"><b>c&#41;</b> <span id="op3Statement">${optionArray[2]}</span></div></div>
                <div style="width: 100%;" id="op4"><div id="id-op4${item.mcqId}" style="width: fit-content;"><b>d&#41;</b> <span id="op4Statement">${optionArray[3]}</span></div></div>
              </div>
            `
            mainArray.push(
              `<div style="padding-left: 5px;" id="opContainer${item.mcqId}"><div style="width: 100%;" id="op1"><div id="id-op1${item.mcqId}" style="width: fit-content;"><b>a&#41;</b> <span id="op1Statement">${optionArray[0]}</span></div></div></div>`,
            )
            mainArray.push(
              `<div style="padding-left: 5px;" id="opContainer${item.mcqId}"><div style="width: 100%;" id="op2"><div id="id-op2${item.mcqId}" style="width: fit-content;"><b>b&#41;</b> <span id="op2Statement">${optionArray[1]}</span></div></div></div>`,
            )
            mainArray.push(
              `<div style="padding-left: 5px;" id="opContainer${item.mcqId}"><div style="width: 100%;" id="op3"><div id="id-op3${item.mcqId}" style="width: fit-content;"><b>c&#41;</b> <span id="op3Statement">${optionArray[2]}</span></div></div></div>`,
            )
            mainArray.push(
              `<div style="padding-left: 5px; padding-bottom: ${paddingBottomSize}px;" id="opContainer${item.mcqId}"><div style="width: 100%;" id="op4"><div id="id-op4${item.mcqId}" style="width: fit-content;"><b>d&#41;</b> <span id="op4Statement">${optionArray[3]}</span></div></div></div>`,
            )
          }
          questionCount++
        }
      }
    }
  }

  let flag = true
  let font = false

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
      alert("Dear sir, please consider some small question and option as it is not adjustable for legal paper")
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
      `Height: ${allContainer.offsetHeight}, marginBS: ${paddingBottomSize}, containerFS: ${containerFontSize}, imgH: ${imgHeight}`,
    )
  }
  loopControl = false
  await buildContent()

  if (window.MathJax) {
    await window.MathJax.typesetPromise([allContainer])
  }
  console.log("Final height:", allContainer.offsetHeight)

  const portion = [
    { idName: "page1Left", size: 648, state: true, content: [] },
    { idName: "page1Right", size: 648, state: true, content: [] },
    { idName: "page2Left", size: 774, state: true, content: [] },
    { idName: "page2Right", size: 774, state: true, content: [] },
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
    el.textContent = mcqMeta.institutionName
  })
  document.querySelectorAll(".examName").forEach((el) => {
    el.textContent = mcqMeta.examName
  })
  document.querySelectorAll(".subject").forEach((el) => {
    el.textContent = mcqMeta.subject
  })
  document.querySelectorAll(".paper").forEach((el) => {
    el.textContent = mcqMeta.paper
    
  })
  document.querySelectorAll(".class").forEach((el) => {
    el.textContent = mcqMeta.className
  })
  document.querySelectorAll(".setCode").forEach((el) => {
    el.textContent = setOption[currentSetIndex % setOption.length] 
  })
  document.querySelectorAll(".totalMark").forEach((el) => {
    el.textContent = mcqMeta.totalMark
  })
  document.querySelectorAll(".totalTime").forEach((el) => {
    el.textContent = mcqMeta.totalTime
  })
  document.querySelectorAll(".headerPage2").forEach((el) => {
    el.textContent = mcqMeta.message
  })

  if (window.MathJax) {
    await window.MathJax.typesetPromise(
      [
        document.getElementById("page1Left"),
        document.getElementById("page1Right"),
        document.getElementById("page2Left"),
        document.getElementById("page2Right"),
      ].filter(Boolean),
    )
  }
}
