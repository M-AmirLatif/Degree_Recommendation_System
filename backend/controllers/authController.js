const Student = require('../models/Student')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const asyncHandler = require('../middleware/asyncHandler')
const { recordAuditEvent } = require('../utils/auditLogger')
const {
  clearAuthCookie,
  setAuthCookie,
} = require('../utils/authCookies')

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

// ─────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new student
// @access  Public
// ─────────────────────────────────────────
const registerStudent = asyncHandler(async (req, res) => {
    const {
      name,
      email,
      password,
      studentId,
      department,
      semester,
      interests,
      careerGoal,
      skillLevel,
      educationLevel,
      previousQualification,
      majorStream,
      subjectsStudied,
      strongSubjects,
      gpa,
      cgpa,
      interestAreas,
      preferredActivities,
      analyticalSkills,
      communicationSkills,
      creativityLevel,
      workPreference,
      teamPreference,
      workEnvironment,
      budget,
      studyLocation,
      needsScholarship,
    } = req.body

    // Check if student already exists
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const normalizedStudentId = String(studentId || '').trim()

    const studentExists = await Student.findOne({
      $or: [{ email: normalizedEmail }, { studentId: normalizedStudentId }],
    })
    if (studentExists) {
      return res.status(409).json({
        message:
          studentExists.email === normalizedEmail
            ? 'A student with this email already exists'
            : 'A student with this student ID already exists',
      })
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new student
    const student = await Student.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      studentId: normalizedStudentId,
      department,
      semester,
      interests,
      careerGoal,
      skillLevel,
      educationLevel,
      previousQualification,
      majorStream,
      subjectsStudied,
      strongSubjects,
      gpa,
      cgpa,
      interestAreas,
      preferredActivities,
      analyticalSkills,
      communicationSkills,
      creativityLevel,
      workPreference,
      teamPreference,
      workEnvironment,
      budget,
      studyLocation,
      needsScholarship,
    })

    if (student) {
      const token = generateToken(student._id)
      setAuthCookie(res, token)
      await recordAuditEvent(req, {
        action: 'auth.registered',
        entityType: 'Student',
        entityId: student._id,
        metadata: {
          role: student.role,
          email: student.email,
        },
      })

      res.status(201).json({
        _id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        department: student.department,
        semester: student.semester,
        role: student.role,
        token,
      })
    }
})

// ─────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login student & get token
// @access  Public
// ─────────────────────────────────────────
const loginStudent = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const normalizedEmail = String(email || '').trim().toLowerCase()

    // Find student by email
    const student = await Student.findOne({ email: normalizedEmail })

    if (!student) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    // Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, student.password)

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(student._id)
    setAuthCookie(res, token)
    req.student = student

    await recordAuditEvent(req, {
      action: 'auth.logged_in',
      entityType: 'Session',
      entityId: student._id,
      metadata: {
        role: student.role,
        email: student.email,
      },
    })

    res.json({
      _id: student._id,
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      department: student.department,
      semester: student.semester,
      role: student.role,
      token,
    })
})

const logoutStudent = asyncHandler(async (req, res) => {
  await recordAuditEvent(req, {
    action: 'auth.logged_out',
    entityType: 'Session',
    entityId: req.student?._id || '',
  })

  clearAuthCookie(res)

  res.json({ message: 'Logged out successfully' })
})

// ─────────────────────────────────────────
// @route   GET /api/auth/profile
// @desc    Get logged in student profile
// @access  Private
// ─────────────────────────────────────────
const getProfile = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.student._id).select('-password')
    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }
    res.json(student)
})

// ─────────────────────────────────────────
// @route   PUT /api/auth/make-admin/:id
// @desc    Make a user admin
// @access  Private
// ─────────────────────────────────────────
const makeAdmin = asyncHandler(async (req, res) => {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { role: 'admin' },
      { returnDocument: 'after' },
    )

    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }

    await recordAuditEvent(req, {
      action: 'admin.user.role_updated',
      entityType: 'Student',
      entityId: student._id,
      metadata: {
        role: student.role,
      },
    })

    res.json({ message: 'User updated to admin', role: student.role })
})

// ─────────────────────────────────────────
// @route   POST /api/auth/forgot-password
// @desc    Generate password reset token
// @access  Public
// ─────────────────────────────────────────
const crypto = require('crypto')


const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  const normalizedEmail = String(email || '').trim().toLowerCase()

  const student = await Student.findOne({ email: normalizedEmail })
  if (!student) {
    // Return friendly generic success message so user accounts cannot be enumerated
    return res.json({
      message: 'If an account exists with that email, a password reset token has been generated.',
    })
  }

  // Generate 32-byte crypto token
  const resetToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  student.resetPasswordToken = hashedToken
  student.resetPasswordExpires = Date.now() + 15 * 60 * 1000 // 15 minutes validity
  await student.save()

  await recordAuditEvent(req, {
    action: 'auth.forgot_password_requested',
    entityType: 'Student',
    entityId: student._id,
    metadata: { email: student.email },
  })

  res.json({
    message: 'Password reset token generated successfully. Valid for 15 minutes.',
    resetToken, // Returned in JSON response for instant reset flow / SMS / direct UI testing
  })
})

// ─────────────────────────────────────────
// @route   POST /api/auth/reset-password
// @desc    Reset password using reset token
// @access  Public
// ─────────────────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' })
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  const student = await Student.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  })

  if (!student) {
    return res.status(400).json({ message: 'Password reset token is invalid or has expired' })
  }

  const salt = await bcrypt.genSalt(10)
  student.password = await bcrypt.hash(password, salt)
  student.resetPasswordToken = undefined
  student.resetPasswordExpires = undefined
  await student.save()

  await recordAuditEvent(req, {
    action: 'auth.password_reset_completed',
    entityType: 'Student',
    entityId: student._id,
  })

  res.json({ message: 'Password has been reset successfully. You can now log in.' })
})

module.exports = {
  registerStudent,
  loginStudent,
  logoutStudent,
  getProfile,
  makeAdmin,
  forgotPassword,
  resetPassword,
}

