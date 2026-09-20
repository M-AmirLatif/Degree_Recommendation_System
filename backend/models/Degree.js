const mongoose = require('mongoose')

const degreeSchema = new mongoose.Schema(
  {
    // ── BASIC INFO ─────────────────────────────
    name: {
      type: String,
      required: true,
      trim: true,
      // e.g. "BS Computer Science", "MBBS", "BBA"
    },
    shortName: {
      type: String,
      // e.g. "BSCS", "MBBS", "BBA"
    },
    field: {
      type: String,
      required: true,
      // e.g. "Technology", "Medical", "Business", "Engineering", "Arts"
    },
    description: {
      type: String,
    },
    duration: {
      type: String,
      // e.g. "4 years", "5 years"
    },

    // ── REQUIREMENTS ───────────────────────────
    requiredSubjects: [
      {
        type: String,
        // e.g. ["Mathematics", "Physics"] for Engineering
      },
    ],
    requiredStream: [
      {
        type: String,
        enum: ['science', 'commerce', 'arts', 'technology', 'any'],
        // e.g. ["science"] for MBBS
      },
    ],
    minGPA: {
      type: Number,
      default: 2.0,
      // minimum GPA required
    },

    // ── UNIVERSITIES IN PAKISTAN ───────────────
    universities: [
      {
        name: { type: String },
        location: { type: String },
        ranking: { type: Number },
        feePerYear: { type: String },
        hasScholarship: { type: Boolean, default: false },
        admissionTest: { type: String }, // e.g. "ECAT", "MDCAT", "NAT"
        website: { type: String },
      },
    ],

    // ── CAREER OUTCOMES ────────────────────────
    careerOutcomes: [
      {
        type: String,
        // e.g. ["Software Engineer", "Data Scientist", "Web Developer"]
      },
    ],
    expectedSalary: {
      type: String,
      // e.g. "PKR 80,000 - 200,000/month"
    },
    jobMarket: {
      type: String,
      enum: ['excellent', 'good', 'moderate', 'limited'],
      default: 'good',
    },

    // ── MATCHING WEIGHTS ──────────────────────
    // What kind of student fits this degree
    idealInterestAreas: [{ type: String }],
    idealActivities: [{ type: String }],
    idealAnalytical: { type: String, enum: ['low', 'medium', 'high'] },
    idealCreativity: { type: String, enum: ['low', 'medium', 'high'] },
    workType: {
      type: String,
      enum: ['theory', 'practical', 'both'],
      default: 'both',
    },

    // ── METADATA ──────────────────────────────
    successRate: { type: Number, default: 80 },
    averageRating: { type: Number, default: 4.0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

degreeSchema.index({ isActive: 1, field: 1 })
degreeSchema.index({ requiredStream: 1, isActive: 1 })
degreeSchema.index({ name: 'text', description: 'text', careerOutcomes: 'text' })

module.exports = mongoose.model('Degree', degreeSchema)

