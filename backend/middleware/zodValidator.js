const { z } = require('zod')

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  studentId: z.string().optional(),
  educationLevel: z.string().optional(),
  previousQualification: z.string().optional(),
  majorStream: z.string().optional(),
  subjectsStudied: z.array(z.string()).optional(),
  strongSubjects: z.array(z.string()).optional(),
  gpa: z.number().min(0).max(4).optional(),
  interestAreas: z.array(z.string()).optional(),
  preferredActivities: z.array(z.string()).optional(),
  analyticalSkills: z.enum(['low', 'medium', 'high']).optional(),
  communicationSkills: z.enum(['low', 'medium', 'high']).optional(),
  creativityLevel: z.enum(['low', 'medium', 'high']).optional(),
  workPreference: z.enum(['theory', 'practical', 'both']).optional(),
  careerGoal: z.string().optional(),
  budget: z.enum(['low', 'medium', 'high']).optional(),
  studyLocation: z.enum(['local', 'abroad', 'online', 'any']).optional(),
  needsScholarship: z.boolean().optional(),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email address is required'),
})

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  token: z.string().min(1, 'Reset token is required'),
})

const compareDegreesSchema = z.object({
  degreeIds: z.array(z.string()).min(2, 'Select at least 2 degrees to compare').max(4, 'Maximum 4 degrees can be compared'),
})

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((issue) => issue.message).join(', ')
      return res.status(400).json({ message: errorMsg, errors: parsed.error.issues })
    }
    req.validatedBody = parsed.data
    next()
  } catch (err) {
    return res.status(400).json({ message: 'Invalid request payload' })
  }
}

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  compareDegreesSchema,
}
