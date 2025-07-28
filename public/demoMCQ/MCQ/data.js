



const urlParams = new URLSearchParams(window.location.search)
const templateId = urlParams.get("templateId")

const superArray = []

function convertMCQData(apiMcqGroups) {
  const converted = []
  let currentMcqId = 1

  apiMcqGroups.forEach((groupArray) => {
    if (!Array.isArray(groupArray) || groupArray.length === 0) {
      return
    }

    const firstItemInGroup = groupArray[0]

    if (firstItemInGroup.mcqType === "mcq-4") {
      const validSubQuestions = (firstItemInGroup.subQuestions || []).filter(
        (subQ) => subQ && subQ.questionText && subQ.questionText.trim() !== "",
      )
      const subQuestionCount = validSubQuestions.length

      let headerText = "Read the following stimulus and answer the questions."
      if (subQuestionCount === 1) {
        headerText = "Read the following stimulus and answer the question."
      } else if (subQuestionCount > 1) {
        headerText = `Read the following stimulus and answer the ${subQuestionCount} questions.`
      }

      const passageMcq = {
        mcqId: currentMcqId.toString(),
        mcqHeader: headerText,
        passage: firstItemInGroup.passage || "",
        passageImgSrc: firstItemInGroup.passageImage || "",
        questions: [],
      }

      validSubQuestions.forEach((subQ, subQIndex) => {
        passageMcq.questions.push({
          qId: `${currentMcqId}.${subQIndex + 1}`,
          question: subQ.questionText || "",
          questionImgSrc: subQ.image || "",
          mcqOptions: subQ.options || ["", "", "", ""],
          mcqAnswer: subQ.correctAnswer || 0,
        })
      })

      while (passageMcq.questions.length < 3) {
        passageMcq.questions.push({
          qId: "",
          question: "",
          questionImgSrc: "",
          mcqOptions: ["", "", "", ""],
          mcqAnswer: null,
        })
      }
      converted.push(passageMcq)
      currentMcqId++
    } else if (firstItemInGroup.mcqType === "mcq-3") {
      const romanNumerals = ["i", "ii", "iii", "iv", "v"]
      let formattedInfoItems = ""

      if (firstItemInGroup.infoItems && Array.isArray(firstItemInGroup.infoItems)) {
        const infoItemsText = firstItemInGroup.infoItems
          .filter((item) => item && item.trim() !== "") 
          .map((item, index) => `${romanNumerals[index] || index + 1}. ${item}`)
          .join("<br>")

        if (infoItemsText) {
          formattedInfoItems = `<br><div style="margin-left: 20px;">${infoItemsText}</div>`
        }
      }

      const mcq3Item = {
        mcqId: currentMcqId.toString(),
        mcqHeader: "", 
        passage: "",
        passageImgSrc: "",
        questions: [],
      }

      mcq3Item.questions.push({
        qId: `${currentMcqId}.1`,
        question: (firstItemInGroup.questionText || "") + formattedInfoItems,
        questionImgSrc: firstItemInGroup.image || "",
        mcqOptions: firstItemInGroup.options || firstItemInGroup.optionsArray || ["", "", "", ""],
        mcqAnswer: firstItemInGroup.correctAnswer || 0,
      })

      while (mcq3Item.questions.length < 3) {
        mcq3Item.questions.push({
          qId: "",
          question: "",
          questionImgSrc: "",
          mcqOptions: ["", "", "", ""],
          mcqAnswer: null,
        })
      }
      converted.push(mcq3Item)
      currentMcqId++
    } else {
      groupArray.forEach((singleMcq) => {
        const standaloneMcq = {
          mcqId: currentMcqId.toString(),
          mcqHeader: "",
          passage: "",
          passageImgSrc: "",
          questions: [
            {
              qId: `${currentMcqId}.1`,
              question: singleMcq.questionText || "",
              questionImgSrc: singleMcq.image || "",
              mcqOptions: singleMcq.options || ["", "", "", ""],
              mcqAnswer: singleMcq.correctAnswer || 0,
            },
            { qId: "", question: "", questionImgSrc: "", mcqOptions: ["", "", "", ""], mcqAnswer: null },
            { qId: "", question: "", questionImgSrc: "", mcqOptions: ["", "", "", ""], mcqAnswer: null },
          ],
        }
        converted.push(standaloneMcq)
        currentMcqId++
      })
    }
  })

  return converted
}

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5)
}

document.addEventListener("DOMContentLoaded", async () => {
  const loadingDiv = document.querySelector(".loading")
  const errorDiv = document.querySelector(".error")

  if (loadingDiv) loadingDiv.style.display = "flex"
  if (errorDiv) errorDiv.style.display = "none"

  if (!templateId) {
    console.error("No templateId provided in URL")
    if (loadingDiv) loadingDiv.style.display = "none"
    if (errorDiv) {
      errorDiv.innerHTML = `
        <h2>Error Loading MCQ Data</h2>
        <p>Template ID missing from URL.</p>
        <button onclick='window.location.reload()' style='margin-top: 20px; padding: 10px 20px; font-size: 16px;'>Retry</button>
      `
      errorDiv.style.display = "flex"
    }
    return
  }

  try {
    const res = await fetch(`/Api/mcq?templateId=${templateId}`)
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    const result = await res.json()

    if (!result.success || !result.data) {
      throw new Error(result.message || "MCQ data not found")
    }

    const data = result.data

    let primaryInfo = {}
    if (typeof data.primaryInfo === "object" && data.primaryInfo !== null && data.primaryInfo.institutionName) {
      primaryInfo = data.primaryInfo
    } else if (data.primaryInfo) {
      try {
        const primaryRes = await fetch(`/Api/createQuestionPrimaryInfo?primaryId=${data.primaryInfo}`)
        const primaryData = await primaryRes.json()
        if (primaryData.success) {
          primaryInfo = primaryData.data
        } else {
          throw new Error("Failed to fetch primary info")
        }
      } catch (err) {
        console.error("Error fetching primary info:", err)
        primaryInfo = {} 
      }
    }

    console.log("Raw primaryInfo object:", primaryInfo)
    console.log("Raw primaryInfo.setCount:", primaryInfo.setCount)

    const mcqMeta = {
      institutionName: primaryInfo.institutionName || "Institution Name",
      examName: primaryInfo.examName || "Exam Name",
      subject: primaryInfo.subject || "Subject",
      paper: primaryInfo.paper || "",
      className: primaryInfo.class || primaryInfo.className || "Class",
      totalMark: primaryInfo.totalMark || "30",
      subjectCode: primaryInfo.subjectCode || "101",
      totalTime: primaryInfo.totalTime || "30 minutes",
      message: primaryInfo.message || "",
      setCount: Number.parseInt(String(primaryInfo.setCount || primaryInfo.totalSet || "1").trim()) || 1,
    }

    console.log("Parsed mcqMeta.setCount:", mcqMeta.setCount) 

    const originalMcqData = Array.isArray(data.mcqs) ? convertMCQData(data.mcqs) : []

    if (originalMcqData.length === 0) {
      if (loadingDiv) loadingDiv.style.display = ""
      if (errorDiv) {
        errorDiv.innerHTML = `
          <h2>No MCQ Questions Found</h2>
          <p>There are no questions associated with this template.</p>
          <button onclick='window.location.reload()' style='margin-top: 20px; padding: 10px 20px; font-size: 16px;'>Go Back</button>
        `
        errorDiv.style.display = "flex"
      }
      return
    }

    if (typeof window.infiniteMCQ === "function") {
      for (let i = 0; i < mcqMeta.setCount; i++) {
        console.log(`Generating set ${i + 1} of ${mcqMeta.setCount}`) 
        const shuffledMcqData = shuffleArray(originalMcqData)
        await window.infiniteMCQ(shuffledMcqData, mcqMeta, i)
        superArray.push(document.body.innerHTML) 
      }

      document.body.innerHTML = ""
      for (let i = 0; i < superArray.length; i++) {
        document.body.innerHTML += superArray[i]
      }

      if (loadingDiv) loadingDiv.style.display = "none"
      console.log("MCQ rendering completed for all sets")
    } else {
      console.warn("window.infiniteMCQ not found. Script might not execute.")
      if (loadingDiv) loadingDiv.style.display = "none"
      if (errorDiv) {
        errorDiv.innerHTML = `
          <h2>Rendering Error</h2>
          <p>The rendering script did not load correctly. Please try again.</p>
          <button onclick='window.location.reload()' style='margin-top: 20px; padding: 10px 20px; font-size: 16px;'>Retry</button>
        `
        errorDiv.style.display = "flex"
      }
    }
  } catch (err) {
    console.error("MCQ data fetch or render error:", err)
    if (loadingDiv) loadingDiv.style.display = "none"
    if (errorDiv) {
      errorDiv.innerHTML = `
        <h2>Error Loading MCQ Data</h2>
        <p>${err.message}</p>
        <p>Template ID: ${templateId}</p>
        <button onclick='window.location.reload()' style='margin-top: 20px; padding: 10px 20px; font-size: 16px;'>Retry</button>
      `
      errorDiv.style.display = "flex"
    }
  }
})
