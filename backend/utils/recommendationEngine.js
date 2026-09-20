// ═══════════════════════════════════════════════════════
//  DEGREE RECOMMENDATION ENGINE
//  Weighted scoring system:
//    Academic Match  → 40%
//    Interests       → 30%
//    Skills          → 15%
//    Career Goals    → 10%
//    Constraints     → 5%
// ═══════════════════════════════════════════════════════

// ── HELPER: Check if arrays share any values ──────────
const hasOverlap = (arr1 = [], arr2 = []) => {
  return arr1.some((a) =>
    arr2.some(
      (b) =>
        a.toLowerCase().includes(b.toLowerCase()) ||
        b.toLowerCase().includes(a.toLowerCase()),
    ),
  )
}

const countOverlap = (arr1 = [], arr2 = []) => {
  return arr1.filter((a) =>
    arr2.some(
      (b) =>
        a.toLowerCase().includes(b.toLowerCase()) ||
        b.toLowerCase().includes(a.toLowerCase()),
    ),
  ).length
}

// ── 1. ACADEMIC MATCH (40 points max) ─────────────────
const scoreAcademic = (student, degree) => {
  let score = 0
  const reasons = []

  // Stream match (15 points)
  const streamEquivalence = {
    'pre-medical': ['science', 'medical', 'pre-medical'],
    'pre-engineering': ['science', 'engineering', 'technology', 'pre-engineering'],
    'ics': ['technology', 'science', 'ics'],
    'technology': ['technology', 'science', 'ics'],
    'commerce': ['commerce', 'business', 'finance'],
    'arts': ['arts', 'humanities', 'social-sciences'],
    'humanities': ['arts', 'humanities', 'social-sciences'],
    'dae': ['technology', 'engineering', 'dae', 'science'],
    'science': ['science', 'technology', 'engineering', 'medical'],
  }

  const studentStreams = [
    student.majorStream,
    ...(streamEquivalence[student.majorStream] || []),
  ].map((s) => String(s || '').toLowerCase())

  const degreeStreams = (degree.requiredStream || []).map((s) => String(s || '').toLowerCase())

  const isAnyStream = degreeStreams.includes('any') || degreeStreams.length === 0
  const isDirectMatch = degreeStreams.some((ds) => studentStreams.includes(ds))

  if (isAnyStream) {
    score += 10
  } else if (isDirectMatch) {
    score += 15
    reasons.push(`Your academic background (${student.majorStream || 'stream'}) aligns with this degree`)
  } else {
    score -= 5
  }

  // Required subjects match (15 points)
  if (degree.requiredSubjects && degree.requiredSubjects.length > 0) {
    const subjectMatch = countOverlap(
      student.subjectsStudied || [],
      degree.requiredSubjects,
    )
    const matchRatio = subjectMatch / degree.requiredSubjects.length
    const subjectScore = Math.round(matchRatio * 15)
    score += subjectScore
    if (subjectScore >= 10) {
      reasons.push(
        `You have studied ${subjectMatch}/${degree.requiredSubjects.length} required subjects`,
      )
    }
  } else {
    score += 10 // no specific requirements
  }

  // Strong subjects bonus (10 points)
  if (student.strongSubjects && student.strongSubjects.length > 0) {
    const strongMatch = countOverlap(
      student.strongSubjects,
      degree.requiredSubjects || [],
    )
    if (strongMatch > 0) {
      score += Math.min(strongMatch * 5, 10)
      reasons.push(`You are strong in key subjects for this degree`)
    }
  }

  // GPA / grade bonus
  const gpa = student.gpa || student.cgpa || 0
  if (gpa >= 3.5) score += 5
  else if (gpa >= 3.0) score += 3
  else if (gpa >= 2.5) score += 1
  else if (gpa < degree.minGPA) score -= 5

  return { score: Math.max(0, Math.min(score, 40)), reasons }
}

// ── 2. INTEREST MATCH (30 points max) ─────────────────
const scoreInterests = (student, degree) => {
  let score = 0
  const reasons = []

  // Interest area match (20 points)
  const interestMatch = countOverlap(
    student.interestAreas || [],
    degree.idealInterestAreas || [],
  )
  if (interestMatch > 0) {
    const interestScore = Math.min(interestMatch * 7, 20)
    score += interestScore
    const matched = (student.interestAreas || []).filter((a) =>
      (degree.idealInterestAreas || []).some(
        (b) =>
          a.toLowerCase().includes(b.toLowerCase()) ||
          b.toLowerCase().includes(a.toLowerCase()),
      ),
    )
    reasons.push(
      `Your interest in ${matched.join(', ')} aligns with this degree`,
    )
  }

  // Preferred activities match (10 points)
  const activityMatch = countOverlap(
    student.preferredActivities || [],
    degree.idealActivities || [],
  )
  if (activityMatch > 0) {
    score += Math.min(activityMatch * 4, 10)
    reasons.push(`Your preferred activities match this field`)
  }

  return { score: Math.min(score, 30), reasons }
}

// ── 3. SKILLS MATCH (15 points max) ───────────────────
const scoreSkills = (student, degree) => {
  let score = 0
  const reasons = []

  // Analytical skills
  const analyticalMap = { low: 1, medium: 2, high: 3 }
  const degreeAnalytical = analyticalMap[degree.idealAnalytical] || 2
  const studentAnalytical = analyticalMap[student.analyticalSkills] || 2

  if (studentAnalytical >= degreeAnalytical) {
    score += 6
    if (
      student.analyticalSkills === 'high' &&
      degree.idealAnalytical === 'high'
    ) {
      reasons.push(`Your high analytical skills are perfect for this degree`)
    }
  } else if (degreeAnalytical - studentAnalytical === 1) {
    score += 3
  }

  // Creativity level
  const degreeCreativity = analyticalMap[degree.idealCreativity] || 2
  const studentCreativity = analyticalMap[student.creativityLevel] || 2
  if (studentCreativity >= degreeCreativity) {
    score += 5
  } else {
    score += 2
  }

  // Work preference (theory vs practical)
  if (
    degree.workType === 'both' ||
    student.workPreference === 'both' ||
    degree.workType === student.workPreference
  ) {
    score += 4
    if (
      degree.workType === student.workPreference &&
      degree.workType !== 'both'
    ) {
      reasons.push(
        `Matches your preference for ${student.workPreference} learning`,
      )
    }
  }

  return { score: Math.min(score, 15), reasons }
}

// ── 4. CAREER GOALS MATCH (10 points max) ─────────────
const scoreCareerGoals = (student, degree) => {
  let score = 0
  const reasons = []

  if (!student.careerGoal) return { score: 5, reasons }

  // Career outcome match
  const careerMatch = (degree.careerOutcomes || []).some(
    (outcome) =>
      outcome.toLowerCase().includes(student.careerGoal.toLowerCase()) ||
      student.careerGoal.toLowerCase().includes(outcome.toLowerCase()),
  )

  if (careerMatch) {
    score += 10
    reasons.push(`Directly leads to your goal: ${student.careerGoal}`)
  } else {
    // Partial keyword match
    const goalWords = student.careerGoal.toLowerCase().split(' ')
    const partialMatch = (degree.careerOutcomes || []).some((outcome) =>
      goalWords.some(
        (word) => word.length > 3 && outcome.toLowerCase().includes(word),
      ),
    )
    if (partialMatch) {
      score += 5
      reasons.push(`Related to your career goal: ${student.careerGoal}`)
    }
  }

  // Work environment
  if (
    student.workEnvironment === 'any' ||
    degree.field === student.workEnvironment ||
    student.workEnvironment === 'office'
  ) {
    score += 2
  }

  return { score: Math.min(score, 10), reasons }
}

// ── 5. CONSTRAINTS MATCH (5 points max) ───────────────
const scoreConstraints = (student, degree) => {
  let score = 3 // base score — constraints rarely disqualify
  const reasons = []

  // Budget vs university fees
  if (student.budget === 'low') {
    const hasAffordable = (degree.universities || []).some(
      (u) => u.hasScholarship || (u.feePerYear && u.feePerYear.includes('Gov')),
    )
    if (hasAffordable) {
      score += 1
      reasons.push(`Scholarship options available`)
    }
  } else if (student.budget === 'high') {
    score += 2
  } else {
    score += 1
  }

  // Scholarship need
  if (student.needsScholarship) {
    const hasScholarship = (degree.universities || []).some(
      (u) => u.hasScholarship,
    )
    if (hasScholarship) {
      score += 1
      reasons.push(`Universities offer scholarship for this degree`)
    }
  }

  // Study location preference
  const locationPref = normalize(student.studyLocation)
  if (locationPref && locationPref !== 'any') {
    const locations = (degree.universities || []).map((u) =>
      normalize(u.location),
    )
    let locationMatch = false
    if (locationPref === 'online') {
      locationMatch = locations.some(
        (loc) => loc.includes('online') || loc.includes('virtual'),
      )
    } else if (locationPref === 'abroad') {
      locationMatch = locations.some((loc) =>
        /(usa|uk|canada|australia|europe|international|abroad)/.test(loc),
      )
    } else if (locationPref === 'local') {
      locationMatch = locations.length > 0
    }

    if (locationMatch) {
      score += 1
      reasons.push('Matches your study location preference')
    } else {
      score -= 1
    }
  }

  return { score: Math.min(score, 5), reasons }
}

// ── CONFIDENCE LABEL ──────────────────────────────────
const getConfidenceLabel = (percentage) => {
  if (percentage >= 85) return 'Excellent Match'
  if (percentage >= 70) return 'Strong Match'
  if (percentage >= 55) return 'Good Match'
  if (percentage >= 40) return 'Possible Match'
  return 'Weak Match'
}

const formatBreakdownScore = (score, maxScore, options = {}) => {
  const { signed = false } = options
  const roundedScore = Number.isInteger(score)
    ? score
    : Number(score.toFixed(1))

  const prefix = signed && roundedScore >= 0 ? '+' : ''
  return `${prefix}${roundedScore}/${maxScore}`
}

const asArray = (value) => (Array.isArray(value) ? value : [])
const getId = (value) =>
  value && value._id ? String(value._id) : value ? String(value) : ''
const getIdSet = (values = []) =>
  new Set(asArray(values).map(getId).filter(Boolean))
const normalize = (value) => String(value || '').trim().toLowerCase()
const normalizeArray = (values = []) =>
  asArray(values).map(normalize).filter(Boolean)

const overlapRatio = (arr1 = [], arr2 = []) => {
  const a = normalizeArray(arr1)
  const b = normalizeArray(arr2)
  if (!a.length || !b.length) return 0
  let matches = 0
  a.forEach((item) => {
    if (b.some((other) => other.includes(item) || item.includes(other))) {
      matches += 1
    }
  })
  return matches / Math.max(a.length, b.length)
}

const keywordOverlap = (textA, textB) => {
  const a = normalize(textA)
    .split(/\s+/)
    .filter((token) => token.length > 3)
  const b = normalize(textB)
    .split(/\s+/)
    .filter((token) => token.length > 3)
  if (!a.length || !b.length) return 0
  let matches = 0
  a.forEach((token) => {
    if (b.some((other) => other.includes(token) || token.includes(other))) {
      matches += 1
    }
  })
  return matches / Math.max(a.length, b.length)
}

const degreeSimilarity = (degreeA, degreeB) => {
  if (!degreeA || !degreeB) return 0
  let score = 0
  let weight = 0

  const fieldMatch =
    normalize(degreeA.field) && normalize(degreeA.field) === normalize(degreeB.field)
      ? 1
      : 0
  score += fieldMatch * 3
  weight += 3

  score += overlapRatio(degreeA.requiredSubjects, degreeB.requiredSubjects) * 3
  weight += 3

  score += overlapRatio(degreeA.idealInterestAreas, degreeB.idealInterestAreas) * 3
  weight += 3

  score += overlapRatio(degreeA.careerOutcomes, degreeB.careerOutcomes) * 2
  weight += 2

  const workMatch =
    normalize(degreeA.workType) &&
    normalize(degreeA.workType) === normalize(degreeB.workType)
      ? 1
      : 0
  score += workMatch * 1
  weight += 1

  return weight ? score / weight : 0
}

const studentSimilarity = (base, other) => {
  if (!base || !other) return 0
  let score = 0
  let weight = 0
  const add = (value, w) => {
    score += value * w
    weight += w
  }

  add(
    normalize(base.majorStream) &&
      normalize(base.majorStream) === normalize(other.majorStream)
      ? 1
      : 0,
    2,
  )
  add(overlapRatio(base.subjectsStudied, other.subjectsStudied), 3)
  add(overlapRatio(base.strongSubjects, other.strongSubjects), 3)
  add(overlapRatio(base.interestAreas, other.interestAreas), 4)
  add(overlapRatio(base.preferredActivities, other.preferredActivities), 2)
  add(
    normalize(base.analyticalSkills) === normalize(other.analyticalSkills)
      ? 1
      : 0,
    1,
  )
  add(
    normalize(base.creativityLevel) === normalize(other.creativityLevel) ? 1 : 0,
    1,
  )
  add(
    normalize(base.workPreference) === normalize(other.workPreference) ? 1 : 0,
    1,
  )
  add(
    normalize(base.workEnvironment) === normalize(other.workEnvironment) ? 1 : 0,
    1,
  )
  add(keywordOverlap(base.careerGoal, other.careerGoal), 2)
  add(normalize(base.budget) === normalize(other.budget) ? 1 : 0, 1)
  add(Boolean(base.needsScholarship) === Boolean(other.needsScholarship) ? 1 : 0, 1)
  add(
    normalize(base.studyLocation) === normalize(other.studyLocation) ? 1 : 0,
    1,
  )

  return weight ? score / weight : 0
}

const scoreFeedback = (degree, context = {}) => {
  const currentPreference = context.currentPreference || null
  if (!currentPreference) return { score: 0, reasons: [], hidden: false }

  const liked = getIdSet(currentPreference.likedDegrees)
  const disliked = getIdSet(currentPreference.dislikedDegrees)
  const degreeId = getId(degree)

  if (disliked.has(degreeId)) {
    return {
      score: -20,
      reasons: ['You marked this degree as a poor fit'],
      hidden: true,
    }
  }

  let score = 0
  const reasons = []

  if (liked.has(degreeId)) {
    score += 10
    reasons.push('You already liked this degree')
  }

  const likedDegrees = asArray(currentPreference.likedDegrees).filter(
    (item) => item && item._id,
  )
  const dislikedDegrees = asArray(currentPreference.dislikedDegrees).filter(
    (item) => item && item._id,
  )

  let similarBoost = 0
  let similarPenalty = 0
  likedDegrees.forEach((likedDegree) => {
    const similarity = degreeSimilarity(degree, likedDegree)
    if (similarity >= 0.35) {
      similarBoost += similarity * 6
    }
  })
  dislikedDegrees.forEach((dislikedDegree) => {
    const similarity = degreeSimilarity(degree, dislikedDegree)
    if (similarity >= 0.35) {
      similarPenalty += similarity * 7
      if (similarity >= 0.65) {
        reasons.push('Similar to a degree you disliked')
      }
    }
  })

  score += similarBoost - similarPenalty

  const communityPreferences = context.communityPreferences || []
  const currentStudent = context.student || null
  let communityScore = 0

  if (currentStudent && Array.isArray(communityPreferences)) {
    communityPreferences.forEach((pref) => {
      if (!pref || !pref.student) return
      const similarity = studentSimilarity(currentStudent, pref.student)
      if (similarity < 0.35) return
      const communityLiked = getIdSet(pref.likedDegrees)
      const communityDisliked = getIdSet(pref.dislikedDegrees)
      if (communityLiked.has(degreeId)) {
        communityScore += similarity * 6
      }
      if (communityDisliked.has(degreeId)) {
        communityScore -= similarity * 4
      }
    })
  }

  if (communityScore >= 2) {
    reasons.push('Students with a similar profile liked this degree')
  }
  if (communityScore <= -2) {
    reasons.push('Students with a similar profile disliked this degree')
  }

  score += communityScore

  if (score > 20) score = 20
  if (score < -20) score = -20

  return { score, reasons, hidden: false }
}

// ── MAIN RECOMMENDATION FUNCTION ─────────────────────
const recommendDegrees = (student, degrees, context = {}) => {
  const MAX_SCORE = 120 // 40 + 30 + 15 + 10 + 5 + 20(feedback)

  const scored = degrees
    .filter((degree) => degree.isActive)
    .map((degree) => {
      const academic = scoreAcademic(student, degree)
      const interests = scoreInterests(student, degree)
      const skills = scoreSkills(student, degree)
      const career = scoreCareerGoals(student, degree)
      const constraints = scoreConstraints(student, degree)
      const feedback = scoreFeedback(degree, context)

      if (feedback.hidden) return null

      const totalScore =
        academic.score +
        interests.score +
        skills.score +
        career.score +
        constraints.score +
        feedback.score

      const matchPercentage = Math.round((totalScore / MAX_SCORE) * 100)

      // Collect all reasons
      const allReasons = [
        ...feedback.reasons,
        ...academic.reasons,
        ...interests.reasons,
        ...skills.reasons,
        ...career.reasons,
        ...constraints.reasons,
      ].slice(0, 4) // max 4 reasons shown

      // Build score breakdown
      const breakdown = {
        academic: formatBreakdownScore(academic.score, 40),
        interests: formatBreakdownScore(interests.score, 30),
        skills: formatBreakdownScore(skills.score, 15),
        career: formatBreakdownScore(career.score, 10),
        constraints: formatBreakdownScore(constraints.score, 5),
        feedback: formatBreakdownScore(feedback.score, 20, { signed: true }),
      }

      return {
        degree,
        totalScore,
        matchPercentage,
        confidenceLabel: getConfidenceLabel(matchPercentage),
        reasons: allReasons,
        breakdown,
      }
    })
    .filter(Boolean)

  // Sort by score, return top matches above 20%
  return scored
    .filter((item) => item.matchPercentage >= 20)
    .sort((a, b) => b.totalScore - a.totalScore)
}

module.exports = recommendDegrees
