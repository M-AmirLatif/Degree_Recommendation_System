const https = require('https')
const logger = require('../utils/logger')

/**
 * Generate customized Academic & Career Milestones tailored to program duration & level
 */
const generateMilestones = (degree, student) => {
  const degreeName = degree.name || 'Your Degree'
  const field = (degree.field || 'General').toLowerCase()
  const level = (degree.level || 'bachelor').toLowerCase()
  const duration = (degree.duration || '4 years').toLowerCase()
  const career = student.careerGoal || (degree.careerOutcomes && degree.careerOutcomes[0]) || 'Professional'

  // ── 1. TWO-YEAR INTERMEDIATE / HSSC (For Matric Students) ──
  if (level === 'intermediate' || duration.includes('2 year') && ['matric', 'olevel'].includes(String(student.educationLevel).toLowerCase())) {
    return {
      year1: {
        title: 'Year 1: HSSC Part 1 Board & Practical Foundations',
        focus: `Mastering foundational concepts of ${degree.shortName || degreeName} (Mathematics, Sciences, or Arts) and securing 85%+ in Part 1 Board Exams.`,
        actionItems: [
          'Master textbook theory and maintain rigorous daily practice for Board / BISE numericals and subjective questions.',
          'Complete all practical laboratory notebooks (Physics, Chemistry, Biology, or Computer Science).',
          'Begin early conceptual preparation for national university entrance tests (NET, MDCAT, ECAT, or LAT).',
          'Aim for top quartile college marks to qualify for full merit tuition fee waivers.',
        ],
        recommendedCertifications: field.includes('tech')
          ? ['Introductory Python & Logic Building', 'Computer Fundamentals']
          : field.includes('medical')
          ? ['Basic Medical First Aid & Biology Explorer', 'Medical Terminology Essentials']
          : ['English Essay Writing Mastery', 'Speed Math & Reasoning'],
      },
      year2: {
        title: 'Year 2: Board Finals & University Entrance Test (MDCAT/NET/ECAT/LAT)',
        focus: 'Excelling in HSSC Part 2 Board Exams and cracking top university entrance tests for high-merit admissions.',
        actionItems: [
          'Solve past 10 years of Board exam papers and appear in full-syllabus college mock tests.',
          `Register and appear in target entry tests (${(degree.universities && degree.universities[0]?.admissionTest) || 'MDCAT / NET / ECAT / LAT'}).`,
          'Shortlist top universities with backup admission options and track scholarship deadlines.',
          'Secure final intermediate certificate and finalize university departmental enrollment.',
        ],
        recommendedCertifications: field.includes('tech')
          ? ['CS50x: Introduction to Computer Science', 'Git & GitHub Basics']
          : field.includes('medical')
          ? ['Pre-Med MDCAT High-Yield Question Bank', 'Human Anatomy Foundations']
          : ['University Entry Test Aptitude Mastery', 'Critical Thinking & Analytical Reasoning'],
      },
    }
  }

  // ── 2. TWO-YEAR LATERAL BS / MASTER'S (For ADP or BS Graduates) ──
  if (level === 'lateral_bs' || level === 'master' || duration.includes('2 year')) {
    return {
      year1: {
        title: 'Year 1: Core Specialization & Advanced Research',
        focus: `Transitioning smoothly into advanced coursework for ${degree.shortName || degreeName} and establishing research / industrial focus.`,
        actionItems: [
          'Excel in advanced theoretical and lab modules, maintaining a CGPA >= 3.3.',
          'Identify your research topic or industrial specialization and select a thesis advisor.',
          'Attend academic colloquiums and connect with industry leaders on LinkedIn.',
          'Form study groups for international certification or GAT/GRE subject testing.',
        ],
        recommendedCertifications: field.includes('tech')
          ? ['AWS Certified Solutions Architect Associate', 'Deep Learning Specialization (Coursera)']
          : field.includes('business')
          ? ['Strategic Business Analytics (Wharton/Coursera)', 'Advanced Financial Modeling']
          : ['Advanced Research Methods & SPSS/R', 'Academic Paper Publishing Framework'],
      },
      year2: {
        title: 'Year 2: Thesis Defense & Senior Placement / High-Growth Career',
        focus: 'Finalizing research thesis or capstone, publishing findings, and securing senior management or technical leadership roles.',
        actionItems: [
          'Complete and defend your Master’s thesis or capstone project with distinction.',
          'Publish at least 1 conference paper or deliver a production-ready enterprise solution.',
          `Apply for senior-tier positions targeting ${degree.expectedSalary || 'top market compensation'}.`,
          'Explore PhD scholarship opportunities abroad (Erasmus, Fulbright, DAAD) if continuing in academia.',
        ],
        recommendedCertifications: field.includes('tech')
          ? ['Kubernetes CKA / Professional Cloud Architect', 'Enterprise System Design']
          : field.includes('business')
          ? ['PMP: Project Management Professional', 'Executive Leadership Specialization']
          : ['International Research Fellow Certification', 'Senior Management Leadership'],
      },
    }
  }

  // ── 3. THREE-YEAR DAE TECHNICAL DIPLOMA ──
  if (level === 'diploma' || duration.includes('3 year')) {
    return {
      year1: {
        title: 'Year 1: Technical Foundations & Engineering Workshop Practice',
        focus: 'Hands-on training in basic engineering workshops, applied physics, mathematics, and technical drafting.',
        actionItems: [
          'Complete hands-on safety and workshop rotations (Machining, Electrical Wiring, Welding, Drafting).',
          'Master technical mathematics and applied mechanics.',
          'Maintain high Board of Technical Education (PBTE/SBTE) exam scores.',
        ],
        recommendedCertifications: ['AutoCAD 2D Fundamentals', 'Industrial Safety & OSHA Basics'],
      },
      year2: {
        title: 'Year 2: Advanced Equipment, Electronics & Instrumentation',
        focus: 'Deep dive into specialized industrial equipment, circuits, hydraulics, or control systems.',
        actionItems: [
          'Operate industrial test equipment, oscilloscopes, and CNC machinery.',
          'Participate in technical model exhibitions and industrial visits.',
          'Learn basic PLC ladder logic or microcontroller programming.',
        ],
        recommendedCertifications: ['PLC Programming Basics', 'Industrial Instrumentation Specialist'],
      },
      year3: {
        title: 'Year 3: Industrial Internship, Final Project & Industry Placement',
        focus: '6-month industrial apprenticeship, final diploma project, and transition to technical jobs or B.Tech/BSEE lateral entry.',
        actionItems: [
          'Complete mandatory industrial apprenticeship at a recognized manufacturing or power facility.',
          'Build a working electromechanical or software hardware project.',
          'Apply for Associate Engineer / Sub-Engineer positions or prepare for BSEE Lateral entry test.',
        ],
        recommendedCertifications: ['Advanced Industrial Automation Lead', 'Professional CAD/CAM Designer'],
      },
    }
  }

  // ── 4. FIVE-YEAR PROFESSIONAL DEGREES (MBBS, BDS, Pharm-D, DPT, LLB, B.Arch) ──
  if (duration.includes('5 year')) {
    return {
      year1: {
        title: 'Year 1: Pre-Clinical / Foundational Theory & Anatomy',
        focus: `Mastering foundational sciences (Gross Anatomy, Legal Systems, or Studio Drafting) for ${degree.shortName || degreeName}.`,
        actionItems: [
          'Adapt to intense academic reading and lab dissection / studio critique culture.',
          'Build daily active recall and spaced repetition flashcards for high volume terms.',
          'Pass all annual professional board exams with distinction marks.',
        ],
        recommendedCertifications: field.includes('medical')
          ? ['Basic Life Support (BLS)', 'Medical Terminology & First Aid']
          : field.includes('law')
          ? ['Legal Case Briefing & Legal English', 'Moot Court Fundamentals']
          : ['Manual Drafting & Architectural Model Making', 'SketchUp & Rhino 3D'],
      },
      year2: {
        title: 'Year 2: Pre-Clinical Integration & Systemic Sciences',
        focus: 'Physiology, Biochemistry, Constitutional Law, or Structural Mechanics mastery.',
        actionItems: [
          'Integrate organ systems or statutory frameworks into clinical/legal reasoning.',
          'Participate in clinical simulations, moot courts, or studio juries.',
          'Maintain strong attendance and hospital/court observational visits.',
        ],
        recommendedCertifications: field.includes('medical')
          ? ['Infection Control & Patient Safety', 'Clinical Pharmacology Intro']
          : ['Human Rights Law & Advocacy', 'Revit BIM Architecture'],
      },
      year3: {
        title: 'Year 3: Clinical Rotations / Core Jurisprudence & Urbanism',
        focus: 'Beginning active hospital bedside rounds, court proceedings, or architectural masterplanning.',
        actionItems: [
          'Take patient clinical histories, perform basic diagnostic examinations under consultant supervision.',
          'Draft commercial agreements, civil plaints, or structural BIM calculations.',
          'Attend national medical/legal/design conferences and submit poster abstracts.',
        ],
        recommendedCertifications: field.includes('medical')
          ? ['Advanced Cardiac Life Support (ACLS)', 'Good Clinical Practice (GCP)']
          : ['Corporate Arbitration & ADR', 'Parametric Climate Simulation'],
      },
      year4: {
        title: 'Year 4: Advanced Specializations & Sub-Internships',
        focus: 'Specialty surgeries, corporate mergers litigation, or comprehensive studio thesis preparation.',
        actionItems: [
          'Complete clinical rotations in Pediatrics, Surgery, OBGYN, or specialized corporate law firms.',
          'Conduct comprehensive field research for final thesis or bar council entry.',
          'Prepare for PMDC / Bar Licensing examination syllabi.',
        ],
        recommendedCertifications: ['Clinical Diagnostic Reasoning', 'Advanced Legal Drafting'],
      },
      year5: {
        title: 'Year 5: Final Year Residency / Comprehensive Thesis & House Job Transition',
        focus: 'Graduating as a licensed practitioner, securing top hospital House Job slots, or launching an architectural/legal career.',
        actionItems: [
          'Clear Final Professional Examination with top merit position.',
          'Secure paid House Job / Judicial Apprenticeship at top tertiary care hospital or law firm.',
          `Transition into independent professional practice targeting ${degree.expectedSalary || 'PKR 85,000 - 350,000/month'}.`,
        ],
        recommendedCertifications: ['Professional Licensing Board Prep', 'Healthcare/Corporate Practice Leadership'],
      },
    }
  }

  // ── 5. FOUR-YEAR BACHELOR'S (BSCS, BSAI, BSSE, BBA, BSEE, BSME, etc.) ──
  return {
    year1: {
      title: 'Year 1: Foundations & Core Exploration',
      focus: `Mastering foundational concepts and adapting to university-level academic rigor in ${degree.shortName || degreeName}.`,
      actionItems: [
        `Excel in introductory coursework for ${degree.shortName || degreeName}.`,
        'Join 1 academic or technical student society (e.g. ACM, IEEE, Debating, Financial Society).',
        'Build basic portfolio repository (GitHub or digital showcase) with 2-3 course projects.',
        'Aim for a GPA >= 3.3 to keep merit scholarship options open.',
      ],
      recommendedCertifications: field.includes('tech')
        ? ['CS50x: Computer Science (Harvard/edX)', 'Git & GitHub Fundamentals']
        : field.includes('business')
        ? ['Excel Skills for Business Specialization', 'Foundations of Project Management']
        : ['Professional Communication Skills', 'Scientific Problem Solving'],
    },
    year2: {
      title: 'Year 2: Skill Acceleration & Applied Projects',
      focus: 'Bridging theoretical coursework with practical hands-on problem solving.',
      actionItems: [
        `Complete intermediate level courses and electives matching your interest in ${student.interestAreas?.[0] || 'your specialization'}.`,
        'Participate in national hackathons, business case competitions, or paper reading groups.',
        'Start personal passion projects solving real-world Pakistani or international problems.',
        'Attend university career fairs to network with visiting tech and corporate recruiters.',
      ],
      recommendedCertifications: field.includes('tech')
        ? ['AWS Certified Cloud Practitioner / Azure Fundamentals', 'Modern Full-Stack Specialization']
        : field.includes('business')
        ? ['Google Data Analytics Certificate', 'Financial Modeling Specialization']
        : ['Industry Standard Tool Certification', 'Advanced Data Analysis with Python/R'],
    },
    year3: {
      title: 'Year 3: Industry Immersion & Summer Internship',
      focus: 'Gaining real-world corporate experience and expanding your professional network.',
      actionItems: [
        `Target and secure a 6–8 week summer internship aligned with your goal to become a ${career}.`,
        'Form a team and pitch your Final Year Project (FYP) / Capstone proposal to faculty advisors.',
        'Optimize LinkedIn profile, reach 500+ industry connections, and practice behavioral interviews.',
        'Collaborate on open-source projects or faculty research initiatives.',
      ],
      recommendedCertifications: field.includes('tech')
        ? ['Docker & Kubernetes Essentials / Meta Backend', 'Database Design Professional']
        : field.includes('business')
        ? ['HubSpot Inbound Marketing / CFA Level 1 Prep', 'Six Sigma Green Belt']
        : ['Agile / Scrum Master (PSM I)', 'Professional Project Management'],
    },
    year4: {
      title: 'Year 4: Capstone Execution & Job Market Launch',
      focus: 'Delivering an exceptional Final Year Project and transitioning into high-paying employment or postgraduate study.',
      actionItems: [
        'Deliver a distinction-grade Final Year Project with a live production demo or published paper.',
        'Begin applying to top graduate trainee programs and software houses 6 months before graduation.',
        'Conduct 10+ mock technical and algorithmic interviews with mentors and alumni.',
        `Negotiate entry-level compensation targeting ${degree.expectedSalary || 'PKR 90,000 - 350,000/month'}.`,
      ],
      recommendedCertifications: field.includes('tech')
        ? ['AWS Solutions Architect Associate', 'System Design Mastery']
        : field.includes('business')
        ? ['Advanced Strategic Management', 'Executive Leadership Certification']
        : ['Professional Graduate Licensure', 'Postgraduate GRE/GAT Prep'],
    },
  }
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

  if (!apiKey || apiKey.trim() === '') {
    return fallback
  }

  const prompt = `You are a Senior Academic and Career Counselor for Pakistani and International students.
Analyze this student profile and degree match:

Student Profile:
- Current Level: ${student.educationLevel}
- Previous Qualification: ${student.previousQualification}
- Stream: ${student.majorStream}
- Studied Subjects: ${(student.subjectsStudied || []).join(', ')}
- Strong Subjects: ${(student.strongSubjects || []).join(', ')}
- Analytical Skills: ${student.analyticalSkills}
- Creativity Level: ${student.creativityLevel}
- Learning Mode: ${student.workPreference}
- Dream Career: ${student.careerGoal}
- Budget: ${student.budget}

Target Degree:
- Name: ${degree.name} (${degree.shortName})
- Field: ${degree.field}
- Level: ${degree.level}
- Duration: ${degree.duration}
- Expected Salary: ${degree.expectedSalary}
- Top Universities in Pakistan: ${(degree.universities || []).map((u) => u.name).join(', ')}

Provide JSON response with this exact structure:
{
  "personalizedOverview": "Concise 2-sentence summary of why this degree matches their profile and future career.",
  "whyFits": ["3 specific bullet points citing their subjects, stream, and aptitude"],
  "skillGaps": ["3 specific skills or subjects they should strengthen"],
  "salaryOutlook": "Realistic compensation expectation in PKR/month in Pakistan and global freelance potential",
  "admissionStrategy": "Actionable entrance exam strategy (e.g. MDCAT, NET, ECAT, LAT, GAT) and merit cutoff tips"
}`

  try {
    const postData = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        response_mime_type: 'application/json',
      },
    })

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    }

    const aiResponse = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data)
          } else {
            reject(new Error(`Gemini API HTTP Error: ${res.statusCode} ${data}`))
          }
        })
      })
      req.on('error', (err) => reject(err))
      req.setTimeout(8000, () => {
        req.destroy()
        reject(new Error('Gemini API timeout'))
      })
      req.write(postData)
      req.end()
    })

    const parsed = JSON.parse(aiResponse)
    const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return fallback

    const aiJson = JSON.parse(text)
    return {
      personalizedOverview: aiJson.personalizedOverview || fallback.personalizedOverview,
      whyFits: aiJson.whyFits || fallback.whyFits,
      skillGaps: aiJson.skillGaps || fallback.skillGaps,
      salaryOutlook: aiJson.salaryOutlook || fallback.salaryOutlook,
      admissionStrategy: aiJson.admissionStrategy || fallback.admissionStrategy,
      roadmap: fallback.roadmap,
    }
  } catch (err) {
    logger.warn('Gemini API failed, using intelligent deterministic synthesis', { error: err.message })
    return fallback
  }
}

module.exports = {
  generateMilestones,
  getAiAdvisorAdvice,
}
