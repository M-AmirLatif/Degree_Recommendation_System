const Student = require('../models/Student')
const Degree = require('../models/Degree')
const Preference = require('../models/Preference')
const Course = require('../models/Course')
const recommendDegrees = require('../utils/recommendationEngine')
const asyncHandler = require('../middleware/asyncHandler')
const { getCache, setCache } = require('../utils/cache')
const { getAiAdvisorAdvice, generateMilestones } = require('../services/aiAdvisorService')

const normalize = (value) => String(value || '').trim().toLowerCase()
const normalizeArray = (values = []) =>
  (Array.isArray(values) ? values : []).map(normalize).filter(Boolean)

const countOverlap = (arr1 = [], arr2 = []) => {
  const a = normalizeArray(arr1)
  const b = normalizeArray(arr2)
  if (!a.length || !b.length) return 0
  let matches = 0
  a.forEach((item) => {
    if (b.some((other) => other.includes(item) || item.includes(other))) {
      matches += 1
    }
  })
  return matches
}

const scoreCourse = (course, student) => {
  let score = 0
  const reasons = []

  const category = course.category || (course.isCore ? 'core' : 'elective')
  if (category === 'core') {
    score += 6
    reasons.push('Core course for this degree')
  } else if (category === 'foundation') {
    score += 4
    reasons.push('Foundation course for this degree')
  } else {
    score += 2
    reasons.push('Elective course in this degree')
  }

  const subjectMatch = countOverlap(
    student.strongSubjects || [],
    course.relevantSubjects || course.tags || [],
  )
  if (subjectMatch > 0) {
    score += Math.min(subjectMatch * 2, 6)
    reasons.push('Matches your strong subjects')
  }

  const interestMatch = countOverlap(
    student.interestAreas || [],
    course.relevantSubjects || course.tags || [],
  )
  if (interestMatch > 0) {
    score += Math.min(interestMatch * 1.5, 5)
    reasons.push('Matches your interests')
  }

  const skillMatch = countOverlap(
    student.preferredActivities || [],
    course.skillTags || course.skillsGained || [],
  )
  if (skillMatch > 0) {
    score += Math.min(skillMatch * 1.5, 4)
    reasons.push('Builds skills you value')
  }

  if (student.careerGoal) {
    const goal = normalize(student.careerGoal)
    const careerList = course.careerTags || course.careerOutcomes || []
    const careerMatch = careerList.some((item) =>
      normalize(item).includes(goal) || goal.includes(normalize(item)),
    )
    if (careerMatch) {
      score += 4
      reasons.push('Supports your career goal')
    }
  }

  const diffMap = { beginner: 1, intermediate: 2, advanced: 3 }
  const skillMap = { low: 1, medium: 2, high: 3 }
  const courseDiff = diffMap[course.difficultyLevel] || 2
  const studentAnalytical = skillMap[student.analyticalSkills] || 2
  if (studentAnalytical >= courseDiff) {
    score += 2
  } else {
    score -= 1
  }

  return { score, reasons }
}

// ─────────────────────────────────────────
// @route   GET /api/recommendations
// @desc    Get recommendations with caching
// @access  Private
// ─────────────────────────────────────────
const getRecommendations = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.student._id)
  if (!student) return res.status(404).json({ message: 'Student not found' })

  // Check cached active degrees
  let degrees = getCache('active_degrees')
  if (!degrees) {
    degrees = await Degree.find({ isActive: true }).lean()
    setCache('active_degrees', degrees, 300) // 5 minutes cache
  }

  if (degrees.length === 0) {
    return res.json({
      student: student.name,
      careerGoal: student.careerGoal,
      interestAreas: student.interestAreas || [],
      totalDegreesAnalyzed: 0,
      recommendations: [],
      message: 'No degrees in database yet. Admin needs to add degrees.',
    })
  }

  const currentPreference = await Preference.findOne({
    student: student._id,
  }).populate('likedDegrees dislikedDegrees')

  const communityPreferences = await Preference.find({
    student: { $ne: student._id },
  })
    .select('student likedDegrees dislikedDegrees')
    .populate(
      'student',
      'majorStream subjectsStudied strongSubjects interestAreas preferredActivities analyticalSkills creativityLevel workPreference workEnvironment careerGoal budget needsScholarship studyLocation',
    )
    .limit(200)
    .lean()

  // Run recommendation engine
  const recommendations = recommendDegrees(student, degrees, {
    currentPreference,
    communityPreferences,
    student,
  })

  const degreeIds = recommendations.map((rec) => rec.degree._id)
  const courses = degreeIds.length
    ? await Course.find({ degree: { $in: degreeIds }, isActive: true })
        .select(
          'degree courseCode title semesterOffered isCore category relevantSubjects skillTags careerTags tags skillsGained careerOutcomes difficultyLevel',
        )
        .sort({ isCore: -1, semesterOffered: 1, title: 1 })
        .lean()
    : []

  const courseMap = new Map()
  courses.forEach((course) => {
    const key = String(course.degree)
    const list = courseMap.get(key) || []
    list.push(course)
    courseMap.set(key, list)
  })

  res.json({
    student: student.name,
    educationLevel: student.educationLevel,
    previousQualification: student.previousQualification,
    careerGoal: student.careerGoal || 'Not specified',
    interestAreas: student.interestAreas || [],
    majorStream: student.majorStream,
    totalDegreesAnalyzed: degrees.length,
    recommendations: recommendations.slice(0, 10).map((rec, index) => ({
      rank: index + 1,
      degreeId: rec.degree._id,
      name: rec.degree.name,
      shortName: rec.degree.shortName,
      level: rec.degree.level || 'bachelor',
      institutionType: rec.degree.institutionType,
      field: rec.degree.field,
      duration: rec.degree.duration,
      description: rec.degree.description,
      matchPercentage: rec.matchPercentage,
      confidenceLabel: rec.confidenceLabel,
      whyRecommended: rec.reasons,
      breakdown: rec.breakdown,
      majorCourses: (() => {
        const allCourses = courseMap.get(String(rec.degree._id)) || []
        if (allCourses.length === 0) return []
        const scored = allCourses.map((course) => {
          const { score, reasons } = scoreCourse(course, student)
          const category = course.category || (course.isCore ? 'core' : 'elective')
          return {
            courseCode: course.courseCode,
            title: course.title,
            semesterOffered: course.semesterOffered,
            category,
            reason: reasons[0] || 'Core course for this degree',
            score,
          }
        })
        scored.sort((a, b) => b.score - a.score)
        return scored.slice(0, 6)
      })(),
      universities: rec.degree.universities || [],
      careerOutcomes: rec.degree.careerOutcomes || [],
      expectedSalary: rec.degree.expectedSalary,
      jobMarket: rec.degree.jobMarket,
      successRate: rec.degree.successRate,
    })),
  })
})

// ─────────────────────────────────────────
// @route   POST /api/recommendations/ai-advisor
// @desc    Get personalized AI career advice for a degree
// @access  Private
// ─────────────────────────────────────────
const getAiAdvice = asyncHandler(async (req, res) => {
  const { degreeId } = req.body
  const student = await Student.findById(req.student._id)
  if (!student) return res.status(404).json({ message: 'Student not found' })

  const degree = await Degree.findById(degreeId)
  if (!degree) return res.status(404).json({ message: 'Degree not found' })

  const cacheKey = `ai_advice_${student._id}_${degree._id}`
  const cachedAdvice = getCache(cacheKey)
  if (cachedAdvice) {
    return res.json(cachedAdvice)
  }

  const advice = await getAiAdvisorAdvice(student, degree)
  setCache(cacheKey, advice, 1800) // Cache advice for 30 minutes

  res.json({
    degreeName: degree.name,
    shortName: degree.shortName,
    ...advice,
  })
})

// ─────────────────────────────────────────
// @route   GET /api/recommendations/:degreeId/roadmap
// @desc    Get 4-Year Milestone Roadmap for degree
// @access  Private
// ─────────────────────────────────────────
const getDegreeRoadmap = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.student._id)
  if (!student) return res.status(404).json({ message: 'Student not found' })

  const degree = await Degree.findById(req.params.degreeId)
  if (!degree) return res.status(404).json({ message: 'Degree not found' })

  const roadmap = generateMilestones(degree, student)

  res.json({
    degree: {
      _id: degree._id,
      name: degree.name,
      shortName: degree.shortName,
      field: degree.field,
      duration: degree.duration,
      expectedSalary: degree.expectedSalary,
    },
    student: {
      name: student.name,
      careerGoal: student.careerGoal,
      majorStream: student.majorStream,
    },
    roadmap,
  })
})

// ─────────────────────────────────────────
// @route   POST /api/degrees/compare
// @desc    Side-by-side comparison of 2-4 degrees
// @access  Public / Private
// ─────────────────────────────────────────
const compareDegrees = asyncHandler(async (req, res) => {
  const { degreeIds } = req.body
  if (!Array.isArray(degreeIds) || degreeIds.length < 2) {
    return res.status(400).json({ message: 'Please provide at least 2 degree IDs to compare' })
  }

  const degrees = await Degree.find({ _id: { $in: degreeIds }, isActive: true })
  if (degrees.length < 2) {
    return res.status(404).json({ message: 'Could not find degrees to compare' })
  }

  const courses = await Course.find({ degree: { $in: degreeIds }, isActive: true })
    .select('degree courseCode title semesterOffered isCore category')
    .sort({ semesterOffered: 1 })
    .lean()

  const comparisonData = degrees.map((deg) => {
    const degCourses = courses.filter((c) => String(c.degree) === String(deg._id))
    return {
      _id: deg._id,
      name: deg.name,
      shortName: deg.shortName,
      field: deg.field,
      duration: deg.duration,
      minGPA: deg.minGPA,
      requiredStream: deg.requiredStream,
      requiredSubjects: deg.requiredSubjects,
      jobMarket: deg.jobMarket,
      expectedSalary: deg.expectedSalary,
      successRate: deg.successRate,
      idealAnalytical: deg.idealAnalytical,
      idealCreativity: deg.idealCreativity,
      workType: deg.workType,
      topUniversities: (deg.universities || []).slice(0, 4),
      careerOutcomes: deg.careerOutcomes || [],
      totalCourses: degCourses.length,
      sampleCourses: degCourses.slice(0, 6),
    }
  })

  res.json({
    totalCompared: comparisonData.length,
    degrees: comparisonData,
  })
})

module.exports = {
  getRecommendations,
  getAiAdvice,
  getDegreeRoadmap,
  compareDegrees,
}
