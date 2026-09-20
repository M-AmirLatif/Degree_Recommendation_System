const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema(
  {
    // ── BASIC INFO ─────────────────────────────
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    studentId: { type: String, required: true, unique: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },

    // ── ACADEMIC BACKGROUND ────────────────────
    educationLevel: {
      type: String,
      enum: [
        'matric',
        'intermediate',
        'dae',
        'alevel',
        'olevel',
        'bachelor',
        'master',
        'other',
      ],
      default: 'intermediate',
    },
    previousQualification: {
      type: String,
      // e.g. "FSc Pre-Engineering", "FSc Pre-Medical", "ICS", "I.Com", "FA", "DAE Mechanical", "A-Levels"
    },
    majorStream: {
      type: String,
      enum: [
        'science',
        'pre-medical',
        'pre-engineering',
        'ics',
        'commerce',
        'arts',
        'humanities',
        'technology',
        'dae',
        'other',
      ],
      default: 'science',
    },
    subjectsStudied: [
      {
        type: String,
        // e.g. ["Mathematics", "Physics", "Computer", "Biology", "Chemistry"]
      },
    ],
    strongSubjects: [
      {
        type: String,
        // subjects student is strong in
      },
    ],
    gpa: {
      type: Number,
      min: 0,
      max: 4,
      default: 0,
    },
    // Keep cgpa for backward compatibility
    cgpa: {
      type: Number,
      min: 0,
      max: 4,
      default: 0,
    },

    // ── PASSWORD RESET ─────────────────────────
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // ── INTERESTS ──────────────────────────────
    interestAreas: [
      {
        type: String,
        // e.g. ["Technology", "Business", "Healthcare", "Arts", "Law", "Engineering"]
      },
    ],
    preferredActivities: [
      {
        type: String,
        // e.g. ["Problem Solving", "Creativity", "Communication", "Research", "Fieldwork"]
      },
    ],

    // ── SKILLS & PERSONALITY ───────────────────
    analyticalSkills: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    communicationSkills: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    creativityLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    workPreference: {
      type: String,
      enum: ['theory', 'practical', 'both'],
      default: 'both',
    },
    teamPreference: {
      type: String,
      enum: ['team', 'individual', 'both'],
      default: 'both',
    },

    // ── CAREER GOALS ───────────────────────────
    careerGoal: {
      type: String,
      // e.g. "Software Engineer", "Doctor", "Businessman", "Designer"
    },
    workEnvironment: {
      type: String,
      enum: ['office', 'field', 'remote', 'any'],
      default: 'any',
    },

    // ── CONSTRAINTS ────────────────────────────
    budget: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    studyLocation: {
      type: String,
      enum: ['local', 'abroad', 'online', 'any'],
      default: 'any',
    },
    needsScholarship: {
      type: Boolean,
      default: false,
    },

    // Degree feedback cache (primary stored in Preference)
    likedDegrees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Degree' }],
    dislikedDegrees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Degree' }],

    // ── LEGACY FIELDS (kept for compatibility) ─
    department: { type: String, default: 'General' },
    semester: { type: Number, default: 1 },
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    interests: [{ type: String }],
  },
  { timestamps: true },
)

studentSchema.index({ email: 1 })
studentSchema.index({ studentId: 1 })
studentSchema.index({ majorStream: 1, educationLevel: 1 })
studentSchema.index({ resetPasswordToken: 1 })

module.exports = mongoose.model('Student', studentSchema)
