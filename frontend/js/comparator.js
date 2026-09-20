/**
 * Degree Comparator & Radar Chart Visualizer
 */
window.DEGREE_COMPARATOR = (function () {
  let selectedDegrees = []
  let chartInstance = null

  function toggleDegreeSelection(degreeId, degreeName) {
    const index = selectedDegrees.findIndex((d) => d.id === degreeId)
    if (index > -1) {
      selectedDegrees.splice(index, 1)
      showAppAlert(`Removed ${degreeName} from comparator`, 'info')
    } else {
      if (selectedDegrees.length >= 3) {
        showAppAlert('You can compare a maximum of 3 degrees at once.', 'warning')
        return
      }
      selectedDegrees.push({ id: degreeId, name: degreeName })
      showAppAlert(`Added ${degreeName} to comparator (${selectedDegrees.length}/3)`, 'success')
    }
    updateComparatorBadge()
  }

  function getSelectedCount() {
    return selectedDegrees.length
  }

  function updateComparatorBadge() {
    const badge = document.getElementById('compareBadge')
    const compareBtn = document.getElementById('openCompareBtn')
    if (badge) {
      badge.textContent = selectedDegrees.length
    }
    if (compareBtn) {
      compareBtn.style.display = selectedDegrees.length >= 2 ? 'inline-flex' : 'none'
    }
  }

  async function openComparatorModal() {
    if (selectedDegrees.length < 2) {
      showAppAlert('Please select at least 2 degrees using the "Compare" checkbox on cards.', 'warning')
      return
    }

    const modal = document.getElementById('comparatorModal')
    if (!modal) return

    modal.style.display = 'flex'
    document.getElementById('comparatorContent').innerHTML = '<div class="loading-state">Loading comparison data...</div>'

    try {
      const data = await window.AUTH_CLIENT.apiFetch('/degrees/compare', {
        method: 'POST',
        body: { degreeIds: selectedDegrees.map((d) => d.id) },
      })

      renderComparison(data.degrees)
    } catch (err) {
      document.getElementById('comparatorContent').innerHTML = `<div class="alert alert-error">Failed to load comparison: ${err.message}</div>`
    }
  }

  function closeComparatorModal() {
    const modal = document.getElementById('comparatorModal')
    if (modal) modal.style.display = 'none'
  }

  function renderComparison(degrees) {
    const container = document.getElementById('comparatorContent')
    if (!container) return

    const headerCols = degrees.map((d) => `<th style="text-align:center; min-width:200px;"><h3>${d.name}</h3><span class="badge badge-primary">${d.field}</span></th>`).join('')
    const salaryRows = degrees.map((d) => `<td><strong>${d.expectedSalary || 'Market standard'}</strong></td>`).join('')
    const jobMarketRows = degrees.map((d) => `<td><span class="badge ${d.jobMarket === 'excellent' ? 'badge-success' : 'badge-info'}">${d.jobMarket}</span></td>`).join('')
    const durationRows = degrees.map((d) => `<td>${d.duration || '4 years'}</td>`).join('')
    const streamsRows = degrees.map((d) => `<td>${(d.requiredStream || []).join(', ') || 'Any'}</td>`).join('')
    const subjectsRows = degrees.map((d) => `<td>${(d.requiredSubjects || []).join(', ') || 'General'}</td>`).join('')
    const universitiesRows = degrees.map((d) => `<td><ul style="padding-left:16px; margin:0; font-size:0.85rem;">${(d.topUniversities || []).map((u) => `<li><strong>${u.name}</strong> (${u.location || ''})</li>`).join('')}</ul></td>`).join('')
    const careerRows = degrees.map((d) => `<td><ul style="padding-left:16px; margin:0; font-size:0.85rem;">${(d.careerOutcomes || []).slice(0, 5).map((c) => `<li>${c}</li>`).join('')}</ul></td>`).join('')

    container.innerHTML = `
      <div style="margin-bottom:24px;">
        <canvas id="radarSkillChart" style="max-height:300px; width:100%;"></canvas>
      </div>

      <div style="overflow-x:auto;">
        <table class="comparison-table" style="width:100%; border-collapse:collapse; text-align:left;">
          <thead>
            <tr style="border-bottom:2px solid rgba(255,255,255,0.1);">
              <th style="padding:12px; width:160px;">Attribute</th>
              ${headerCols}
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
              <td style="padding:12px; font-weight:600; color:#818cf8;">Expected Salary</td>
              ${salaryRows}
            </tr>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
              <td style="padding:12px; font-weight:600; color:#818cf8;">Job Market</td>
              ${jobMarketRows}
            </tr>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
              <td style="padding:12px; font-weight:600; color:#818cf8;">Duration</td>
              ${durationRows}
            </tr>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
              <td style="padding:12px; font-weight:600; color:#818cf8;">Required Streams</td>
              ${streamsRows}
            </tr>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
              <td style="padding:12px; font-weight:600; color:#818cf8;">Key Subjects</td>
              ${subjectsRows}
            </tr>
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
              <td style="padding:12px; font-weight:600; color:#818cf8;">Top Universities</td>
              ${universitiesRows}
            </tr>
            <tr>
              <td style="padding:12px; font-weight:600; color:#818cf8;">Career Pathways</td>
              ${careerRows}
            </tr>
          </tbody>
        </table>
      </div>
    `

    renderRadarChart(degrees)
  }

  function renderRadarChart(degrees) {
    const canvas = document.getElementById('radarSkillChart')
    if (!canvas || typeof Chart === 'undefined') return

    if (chartInstance) {
      chartInstance.destroy()
    }

    const colors = [
      { bg: 'rgba(99, 102, 241, 0.2)', border: '#6366f1' },
      { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981' },
      { bg: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b' },
    ]

    const skillMap = { low: 40, medium: 70, high: 95 }
    const marketMap = { limited: 40, moderate: 65, good: 85, excellent: 100 }

    const datasets = degrees.map((d, i) => {
      const color = colors[i % colors.length]
      return {
        label: d.shortName || d.name,
        data: [
          skillMap[d.idealAnalytical] || 70,
          skillMap[d.idealCreativity] || 70,
          d.workType === 'practical' ? 90 : d.workType === 'theory' ? 50 : 75,
          marketMap[d.jobMarket] || 80,
          d.successRate || 80,
        ],
        backgroundColor: color.bg,
        borderColor: color.border,
        borderWidth: 2,
        pointBackgroundColor: color.border,
      }
    })

    chartInstance = new Chart(canvas, {
      type: 'radar',
      data: {
        labels: ['Analytical Demand', 'Creativity Level', 'Practical Rigor', 'Market Demand', 'Success Rate'],
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            pointLabels: { color: '#cbd5e1', font: { size: 12 } },
            ticks: { display: false, min: 0, max: 100 },
          },
        },
        plugins: {
          legend: {
            labels: { color: '#f8fafc', font: { size: 13, weight: 'bold' } },
          },
        },
      },
    })
  }

  return {
    toggleDegreeSelection,
    getSelectedCount,
    openComparatorModal,
    closeComparatorModal,
    updateComparatorBadge,
  }
})()
