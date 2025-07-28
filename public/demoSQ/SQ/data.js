

const urlParams = new URLSearchParams(window.location.search)
const templateId = urlParams.get("templateId")

const superArray = []

function convertSQData(apiSqData) {
  if (!apiSqData || !apiSqData.sqGroup || !Array.isArray(apiSqData.sqGroup.questions)) {
    return []
  }

  return apiSqData.sqGroup.questions.map((sq, index) => ({
    id: sq.id || (index + 1).toString(),
    question: sq.questionText || "",
    questionImgSrc: sq.image || "",
    marks: sq.marks || 2,
  }))
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
        <h2>Error Loading SQ Data</h2>
        <p>Template ID missing from URL.</p>
        <button onclick='window.location.reload()' style='margin-top: 20px; padding: 10px 20px; font-size: 16px;'>Retry</button>
      `
      errorDiv.style.display = "flex"
    }
    return
  }

  try {
    const res = await fetch(`/Api/sq?templateId=${templateId}`)
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    const result = await res.json()

    if (!result.success || !result.data) {
      throw new Error(result.message || "SQ data not found")
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

    window.sqMeta = {
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

    console.log("Parsed sqMeta.setCount:", window.sqMeta.setCount) 

    const originalSqData = convertSQData(data)

    if (originalSqData.length === 0) {
      if (loadingDiv) loadingDiv.style.display = "none"
      if (errorDiv) {
        errorDiv.innerHTML = `
          <h2>No SQ Questions Found</h2>
          <p>There are no questions associated with this template.</p>
          <button onclick='window.location.reload()' style='margin-top: 20px; padding: 10px 20px; font-size: 16px;'>Go Back</button>
        `
        errorDiv.style.display = "flex"
      }
      return
    }

    window.originalSqData = originalSqData

    if (typeof window.infiniteSQ === "function") {
      for (let i = 0; i < window.sqMeta.setCount; i++) {
        console.log(`Generating SQ set ${i + 1} of ${window.sqMeta.setCount}`) 
        const shuffledSqData = shuffleArray(originalSqData)
        await window.infiniteSQ(shuffledSqData, window.sqMeta, i) 
        superArray.push(document.body.innerHTML) 
      }

      document.body.innerHTML = ""
      for (let i = 0; i < superArray.length; i++) {
        document.body.innerHTML += superArray[i]
      }

      if (loadingDiv) loadingDiv.style.display = "none"
      console.log("SQ rendering completed for all sets")
    } else {
      console.warn("window.infiniteSQ not found. Script might not execute.")
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
    console.error("SQ data fetch or render error:", err)
    if (loadingDiv) loadingDiv.style.display = "none"
    if (errorDiv) {
      errorDiv.innerHTML = `
        <h2>Error Loading SQ Data</h2>
        <p>${err.message}</p>
        <p>Template ID: ${templateId}</p>
        <button onclick='window.location.reload()' style='margin-top: 20px; padding: 10px 20px; font-size: 16px;'>Retry</button>
      `
      errorDiv.style.display = "flex"
    }
  }
})
