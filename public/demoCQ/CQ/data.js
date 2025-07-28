const urlParams = new URLSearchParams(window.location.search)
const templateId = urlParams.get("templateId")

window.cqData = null
window.cqMeta = null

function renderCQ(meta, data) {
  console.log("renderCQ function is called with meta and data")
}

if (!templateId) {
  console.error("No templateId provided in URL")
  document.body.innerHTML =
    "<div style='text-align: center; margin-top: 50px; font-size: 18px; color: red;'>Error: Template ID missing from URL</div>"
} else {
  fetch(`/Api/cq?templateId=${templateId}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      return res.json()
    })
    .then(async (result) => {
      console.log("API Response:", result)

      if (!result.success || !result.data) {
        throw new Error(result.message || "CQ data not found")
      }

      const data = result.data

      let primaryInfo = {}
      if (typeof data.primaryInfo === "object" && data.primaryInfo !== null && data.primaryInfo.institutionName) {
        primaryInfo = data.primaryInfo
        console.log("Primary info is populated")
      } else if (data.primaryInfo) {
        console.log("Primary info not populated, fetching separately...")
        try {
          const primaryRes = await fetch(`/Api/createQuestionPrimaryInfo?primaryId=${data.primaryInfo}`)
          const primaryData = await primaryRes.json()
          if (primaryData.success) {
            primaryInfo = primaryData.data
            console.log("Primary info fetched successfully")
          } else {
            throw new Error("Failed to fetch primary info")
          }
        } catch (err) {
          console.error("Error fetching primary info:", err)
          primaryInfo = {}
        }
      } else {
        console.warn("No primary info available")
        primaryInfo = {}
      }

      window.cqMeta = {
        institutionName: primaryInfo.institutionName || "Institution Name",
        examName: primaryInfo.examName || "Exam Name",
        subject: primaryInfo.subject || "Subject",
        paper: primaryInfo.paper || "",
        className: primaryInfo.class || primaryInfo.className || "Class",
        totalMark: primaryInfo.totalMark || "30",
        subjectCode: primaryInfo.subjectCode || "101",
        totalTime: primaryInfo.totalTime || "30 minutes",
        message: primaryInfo.message || "",
      }

      window.cqData = Array.isArray(data.cqs) ? data.cqs : []

      console.log("cqMeta:", window.cqMeta)
      console.log("cqData:", window.cqData)
      console.log("Number of CQs:", window.cqData.length)

      if (typeof renderCQ === "function") {
        console.log("Calling renderCQ function...")
        renderCQ(window.cqMeta, window.cqData)
      } else {
        console.log("renderCQ function not yet available, data is ready")
      }
    })  
  
    .catch((err) => {
      console.error("CQ data fetch error:", err)
      document.body.innerHTML = `
        <div style='text-align: center; margin-top: 50px; font-size: 18px; color: red;'>
          <h2>Error Loading CQ Data</h2>
          <p>${err.message}</p>
          <p>Template ID: ${templateId}</p>
          <button onclick='window.location.reload()' style='margin-top: 20px; padding: 10px 20px; font-size: 16px;'>Retry</button>
        </div>
      `
    })
}


