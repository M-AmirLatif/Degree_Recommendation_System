const https = require('https')
const logger = require('../utils/logger')

/**
 * Generate customized 4-Year Academic & Career Milestones
 */
const generateMilestones = (degree, student) => {
  const degreeName = degree.name || 'Your Degree'
  const field = (degree.field || 'General').toLowerCase()
  const career = student.careerGoal || (degree.careerOutcomes && degree.careerOutcomes[0]) || 'Professional'

  const milestones = {
    year1: {
      title: 'Year 1: Foundations & Core Exploration',
      focus: 'Mastering fundamental concepts and adapting to university-level academic rigor.',
      actionItems: [
        `Excel in introductory coursework for ${degree.shortName || degreeName}.`,
        'Join 1 academic or technical student society (e.g. ACM, IEEE, Debating, IEEE Student Branch).',
        'Build basic portfolio repository (GitHub or digital portfolio) with 2-3 course projects.',
        'Identify target GPA threshold (aim for >= 3.2 to keep scholarship options open).',
      ],
      recommendedCertifications: field.includes('tech')
        ? ['CS50x or Python for Everybody', 'Git & GitHub Fundamentals']
        : field.includes('business')
        ? ['Excel Skills for Business (Coursera)', 'Foundations of Project Management']
        : field.includes('medical')
        ? ['Basic Life Support (BLS)', 'Medical Terminology & Bioethics']
        : ['Professional Communication Skills', 'Research Methodology Basics'],
    },
    year2: {
      title: 'Year 2: Skill Acceleration & Applied Projects',
      focus: 'Bridging theoretical coursework with practical hands-on problem solving.',
      actionItems: [
        `Complete intermediate level courses and choose electives matching your interest in ${student.interestAreas?.[0] || 'your specialization'}.`,
        'Participate in national hackathons, business case competitions, or academic paper reading groups.',
        'Start personal passion projects solving real-world Pakistani or regional problems.',
        'Attend university career fairs to network with visiting recruiters.',
      ],
      recommendedCertifications: field.includes('tech')
        ? ['AWS Certified Cloud Practitioner or Azure Fundamentals', 'Frontend/Backend Specialized Course']
        : field.includes('business')
        ? ['Google Data Analytics Certificate', 'Financial Modeling Specialization']
        : field.includes('medical')
        ? ['Clinical Skills & Simulation Training', 'Epidemiology Basics']
        : ['Industry Standard Tool Certification', 'Advanced Data Analysis with SPSS/R'],
    },
    year3: {
      title: 'Year 3: Industry Immersion & Summer Internship',
      focus: 'Gaining real-world corporate/clinical/field experience and expanding your professional network.',
      actionItems: [
        `Target and secure a 6–8 week summer internship aligned with your goal to become a ${career}.`,
        'Form a team and pitch your Final Year Project (FYP) / Capstone proposal to faculty advisors.',
        'Optimize LinkedIn profile, reach 500+ relevant connections, and request informational interviews.',
        'Collaborate on open-source projects or contribute to faculty research initiatives.',
      ],
      recommendedCertifications: field.includes('tech')
        ? ['Docker & Kubernetes Essentials or Meta Backend Professional', 'Database Design Professional']
        : field.includes('business')
        ? ['HubSpot Inbound Marketing or CFA Level 1 Preparation', 'Six Sigma Green Belt']
        : field.includes('medical')
        ? ['Good Clinical Practice (GCP) Certification', 'Advanced Clinical Pharmacology']
        : ['Agile / Scrum Master (PSM I)', 'Professional Project Management'],
    },
    year4: {
      title: 'Year 4: Capstone Execution & Job Market Launch',
      focus: 'Delivering an exceptional Final Year Project and transitioning into high-paying employment or postgraduate study.',
      actionItems: [
        'Deliver a distinction-grade Final Year Project with a live demo or published research paper.',
        'Begin applying to top graduate trainee programs, multinational corporations, or master’s scholarships 6 months before graduation.',
        'Conduct 10+ mock technical and behavioral interviews with mentors and alumni.',
        `Negotiate initial entry-level compensation targeting ${degree.expectedSalary || 'top market quartile'}.`,
      ],
      recommendedCertifications: field.includes('tech')
        ? ['AWS Certified Solutions Architect or Professional Scrum Developer', 'System Design Mastery']
        : field.includes('business')
        ? ['PMP Prep or ACCA/CIMA Papers', 'Advanced Strategic Management']
        : field.includes('medical')
        ? ['PMDC/Provincial Licensing Exam Prep', 'Hospital Residency Applications']
        : ['Executive Leadership Certification', 'Postgraduate GRE/GAT Subject Prep'],
    },
  }

  return milestones
}

/**
 * Intelligent Fallback Synthesis Engine
 */
const synthesizeAdvice = (student, degree) => {
  const stream = student.majorStream || 'science'
  const analytical = student.analyticalSkills || 'medium'
  const creativity = student.creativityLevel || 'medium'
  const career = student.careerGoal || 'Specialist'
  const degreeName = degree.name || 'Degree'

  const whyFits = [
    `Your background in ${stream.toUpperCase()} with ${student.previousQualification || 'your academic qualification'} provides a strong launching pad for ${degreeName}.`,
    `Your ${analytical} analytical capability aligns well with the problem-solving and critical thinking required in this curriculum.`,
    `Direct alignment with your career ambition: ${degreeName} is the gold standard pathway to becoming a successful ${career}.`,
  ]

  if (student.strongSubjects && student.strongSubjects.length > 0) {
    whyFits.push(`Your strength in ${student.strongSubjects.join(', ')} directly reinforces key foundational courses in this degree.`)
  }

  const skillGaps = [
    analytical === 'low'
      ? 'Focus on strengthening foundational mathematics and logical reasoning before starting semester 1.'
      : 'Maintain active practice in applied problem-solving to stay ahead in high-intensity semesters.',
    creativity === 'low'
      ? 'Practice creative ideation and design thinking to make your capstone and projects stand out.'
      : 'Leverage your high creativity to design unique solutions, startup MVPs, or user-centric systems.',
    'Build strong professional English communication and technical writing skills for interviews.',
  ]

  const salaryOutlook = degree.expectedSalary
    ? `Expected entry-to-mid career compensation ranges around ${degree.expectedSalary}, with exponential growth potential for top 15% performers.`
    : 'Strong ROI with rapidly growing industry demand in both local and international markets.'

  const admissionStrategy = degree.universities && degree.universities.length > 0
    ? `Prepare early for entrance exams (such as ${degree.universities.map((u) => u.admissionTest).filter(Boolean).slice(0, 3).join(', ') || 'university entry tests'}). Aim for test scores above 75% for merit list placement.`
    : 'Apply to top-tier universities with active scholarship programs and high industry hiring rates.'

  return {
    personalizedOverview: `Based on your profile as a ${student.educationLevel || 'student'} with strong interests in ${student.interestAreas?.join(', ') || 'your field'}, ${degreeName} offers a high-impact, high-growth academic trajectory.`,
    whyFits,
    skillGaps,
    salaryOutlook,
    admissionStrategy,
    roadmap: generateMilestones(degree, student),
  }
}

/**
 * Call Gemini API with Fallback
 */
const getAiAdvisorAdvice = async (student, degree) => {
  const apiKey = process.env.GEMINI_API_KEY
  const fallback = synthesizeAdvice(student, degree)

  if (!apiKey) {
    return {
      source: 'rule-synthesis',
      ...fallback,
    }
  }

  try {
    const prompt = `You are an expert University Career Counselor.
Student Profile:
- Name: ${student.name}
- Education Level: ${student.educationLevel}
- Qualification: ${student.previousQualification || 'Not specified'}
- Major Stream: ${student.majorStream}
- Strong Subjects: ${(student.strongSubjects || []).join(', ')}
- Interests: ${(student.interestAreas || []).join(', ')}
- Analytical Skills: ${student.analyticalSkills}
- Creativity Level: ${student.creativityLevel}
- Career Goal: ${student.careerGoal || 'Not specified'}
- Budget: ${student.budget}

Recommended Degree:
- Name: ${degree.name} (${degree.shortName || ''})
- Field: ${degree.field}
- Expected Salary: ${degree.expectedSalary || 'Market Standard'}
- Job Market: ${degree.jobMarket}

Provide comprehensive career guidance JSON with this exact schema:
{
  "personalizedOverview": "Concise 2-3 sentence counselor summary for this student",
  "whyFits": ["Point 1", "Point 2", "Point 3"],
  "skillGaps": ["Gap/Recommendation 1", "Gap/Recommendation 2"],
  "salaryOutlook": "Insight on salary trajectory and ROI",
  "admissionStrategy": "Tips on admission tests and preparation"
}`

    const payload = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    })

    const result = await new Promise((resolve, reject) => {
      const req = https.request(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
          timeout: 7000,
        },
        (res) => {
          let data = ''
          res.on('data', (chunk) => {
            data += chunk
          })
          res.on('end', () => {
            try {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                const parsed = JSON.parse(data)
                const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text
                if (text) {
                  resolve(JSON.parse(text))
                  return
                }
              }
              resolve(null)
            } catch (e) {
              resolve(null)
            }
          })
        },
      )

      req.on('timeout', () => {
        req.destroy()
        resolve(null)
      })

      req.on('error', (err) => {
        logger.warn('Gemini API request error', { error: err.message })
        resolve(null)
      })

      req.write(payload)
      req.end()
    })

    if (result && result.personalizedOverview) {
      return {
        source: 'gemini-ai',
        personalizedOverview: result.personalizedOverview,
        whyFits: result.whyFits || fallback.whyFits,
        skillGaps: result.skillGaps || fallback.skillGaps,
        salaryOutlook: result.salaryOutlook || fallback.salaryOutlook,
        admissionStrategy: result.admissionStrategy || fallback.admissionStrategy,
        roadmap: fallback.roadmap,
      }
    }
  } catch (error) {
    logger.warn('AI Advisor fallback triggered', { error: error.message })
  }

  return {
    source: 'rule-synthesis',
    ...fallback,
  }
}

module.exports = {
  getAiAdvisorAdvice,
  generateMilestones,
  synthesizeAdvice,
}
