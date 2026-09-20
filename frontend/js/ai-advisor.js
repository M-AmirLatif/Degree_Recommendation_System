/**
 * AI Career Advisor & 4-Year Roadmap Interface
 */
window.AI_ADVISOR = (function () {
  async function openAdvisor(degreeId, degreeName) {
    const modal = document.getElementById('aiAdvisorModal')
    if (!modal) return

    modal.style.display = 'flex'
    document.getElementById('aiAdvisorTitle').textContent = `AI Career Counselor: ${degreeName}`
    document.getElementById('aiAdvisorContent').innerHTML = `
      <div class="loading-state" style="text-align:center; padding:30px;">
        <div style="font-size:1.5rem; margin-bottom:10px;">✨ Generating AI Career Analysis...</div>
        <p style="color:#94a3b8;">Analyzing your academic profile, skill suitability, and 4-year roadmap.</p>
      </div>
    `

    try {
      const data = await window.AUTH_CLIENT.apiFetch('/recommendations/ai-advisor', {
        method: 'POST',
        body: { degreeId },
      })

      renderAdvisorData(data)
    } catch (err) {
      document.getElementById('aiAdvisorContent').innerHTML = `
        <div class="alert alert-error">Failed to generate AI guidance: ${err.message}</div>
      `
    }
  }

  function closeAdvisor() {
    const modal = document.getElementById('aiAdvisorModal')
    if (modal) modal.style.display = 'none'
  }

  function renderAdvisorData(data) {
    const container = document.getElementById('aiAdvisorContent')
    if (!container) return

    const whyList = (data.whyFits || []).map((w) => `<li>${w}</li>`).join('')
    const gapList = (data.skillGaps || []).map((g) => `<li>${g}</li>`).join('')

    const rm = data.roadmap || {}
    const renderYear = (yearKey, yearNum) => {
      const y = rm[yearKey]
      if (!y) return ''
      return `
        <div class="roadmap-year-card" style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:16px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h4 style="margin:0; color:#818cf8;">${y.title}</h4>
            <span class="badge badge-info">Year ${yearNum}</span>
          </div>
          <p style="font-size:0.9rem; color:#cbd5e1; margin-bottom:10px;">${y.focus}</p>
          <div style="margin-bottom:10px;">
            <strong style="font-size:0.85rem; color:#a5b4fc;">Key Action Items:</strong>
            <ul style="padding-left:20px; margin:4px 0 0 0; font-size:0.85rem; color:#cbd5e1;">
              ${(y.actionItems || []).map((a) => `<li>${a}</li>`).join('')}
            </ul>
          </div>
          <div>
            <strong style="font-size:0.85rem; color:#34d399;">Recommended Certifications & Tools:</strong>
            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">
              ${(y.recommendedCertifications || []).map((c) => `<span style="font-size:0.75rem; background:rgba(16,185,129,0.15); color:#6ee7b7; border:1px solid rgba(16,185,129,0.3); border-radius:6px; padding:3px 8px;">${c}</span>`).join('')}
            </div>
          </div>
        </div>
      `
    }

    container.innerHTML = `
      <div style="background:linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15)); border:1px solid rgba(129,140,248,0.3); border-radius:12px; padding:18px; margin-bottom:20px;">
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
          <span style="font-size:1.4rem;">🤖</span>
          <h3 style="margin:0; color:#f8fafc;">Counselor Assessment</h3>
          <span class="badge ${data.source === 'gemini-ai' ? 'badge-success' : 'badge-primary'}" style="margin-left:auto;">${data.source === 'gemini-ai' ? 'Gemini AI Verified' : 'AI Engine'}</span>
        </div>
        <p style="margin:0; font-size:0.95rem; line-height:1.6; color:#e2e8f0;">${data.personalizedOverview}</p>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px; margin-bottom:20px;">
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:16px;">
          <h4 style="margin:0 0 10px 0; color:#34d399;">🎯 Why This Degree Suits You</h4>
          <ul style="padding-left:20px; margin:0; font-size:0.85rem; color:#cbd5e1; line-height:1.5;">${whyList}</ul>
        </div>
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:16px;">
          <h4 style="margin:0 0 10px 0; color:#f59e0b;">⚡ Bridge Your Skill Gaps</h4>
          <ul style="padding-left:20px; margin:0; font-size:0.85rem; color:#cbd5e1; line-height:1.5;">${gapList}</ul>
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:16px; margin-bottom:20px;">
        <h4 style="margin:0 0 8px 0; color:#818cf8;">💰 Salary Outlook & Admission Strategy</h4>
        <p style="font-size:0.9rem; color:#cbd5e1; margin-bottom:8px;"><strong>Compensation:</strong> ${data.salaryOutlook}</p>
        <p style="font-size:0.9rem; color:#cbd5e1; margin:0;"><strong>Admission Test:</strong> ${data.admissionStrategy}</p>
      </div>

      <div style="margin-top:24px;">
        <h3 style="color:#f8fafc; margin-bottom:16px;">🗺️ Step-by-Step Academic & Career Roadmap</h3>
        ${renderYear('year1', 1)}
        ${renderYear('year2', 2)}
        ${renderYear('year3', 3)}
        ${renderYear('year4', 4)}
        ${renderYear('year5', 5)}
      </div>
    `
  }

  return {
    openAdvisor,
    closeAdvisor,
  }
})()
