const mongoose = require('mongoose')

const degreeSchema = new mongoose.Schema(
  {
    // ── BASIC INFO ─────────────────────────────
    name: {
      type: String,
      required: true,
      trim: true,
      // e.g. "BS Computer Science", "FSc Pre-Medical (Intermediate)", "DAE Electrical Diploma", "MS Data Science"
    },
    shortName: {
      type: String,
      // e.g. "BSCS", "FSC-MED", "DAE-EE", "MS-DS"
    },
    level: {
      type: String,
      enum: ['intermediate', 'diploma', 'associate', 'bachelor', 'lateral_bs', 'master', 'all'],
      default: 'bachelor',
      // e.g. 'intermediate' (2 yrs), 'diploma' (3 yrs), 'bachelor' (4-5 yrs), 'lateral_bs' (2 yrs), 'master' (2 yrs)
    },
    targetAudience: [
      {
        type: String,
        // e.g. ["matric", "olevel"] or ["intermediate", "fsc", "ics", "dae", "alevel"] or ["adp", "ba_bsc"] or ["bachelor"]
      },
    ],
    institutionType: {
      type: String,
      default: 'Universities',
      // e.g. "Higher Secondary Colleges", "Technical Boards & Poly-Institutes", "Universities & DAIs"
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
      // e.g. "2 years", "3 years", "4 years", "5 years"
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
        // e.g. ["science", "pre-medical", "pre-engineering", "ics", "commerce", "arts", "dae", "any"]
      },
    ],
    minGPA: {
      type: Number,
      default: 2.0,
      // minimum GPA or equivalent percentage (60% = 2.5) required
    },

    // ── INSTITUTIONS IN PAKISTAN ───────────────
    universities: [
      {
        name: { type: String },
        location: { type: String },
        ranking: { type: Number },
        feePerYear: { type: String },
        hasScholarship: { type: Boolean, default: false },
        admissionTest: { type: String }, // e.g. "Matric BISE Merit", "ECAT", "MDCAT", "NAT", "GAT"
        website: { type: String },
      },
    ],

    // ── CAREER OUTCOMES ────────────────────────
    careerOutcomes: [
      {
        type: String,
        // e.g. ["Software Engineer", "Data Scientist", "Pre-Med College Pathway"]
      },
    ],
    expectedSalary: {
      type: String,
      // e.g. "PKR 80,000 - 200,000/month" or "Higher Studies / Intermediate Pathway"
    },
    jobMarket: {
      type: String,
      enum: ['excellent', 'good', 'moderate', 'limited'],
      default: 'good',
    },

    // ── MATCHING WEIGHTS ──────────────────────
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

degreeSchema.index({ isActive: 1, field: 1, level: 1 })
degreeSchema.index({ targetAudience: 1, isActive: 1 })
degreeSchema.index({ requiredStream: 1, isActive: 1 })
degreeSchema.index({ name: 'text', description: 'text', careerOutcomes: 'text' })

module.exports = mongoose.model('Degree', degreeSchema)
