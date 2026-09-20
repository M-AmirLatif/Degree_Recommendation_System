const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema(
  {
    // Basic course info
    courseCode: {
      type: String,
      required: true,
      unique: true,
      // e.g. "CS301", "BUS201"
    },
    title: {
      type: String,
      required: true,
      // e.g. "Machine Learning Fundamentals"
    },
    description: {
      type: String,
      required: true,
      // brief summary of what course covers
    },
    department: {
      type: String,
      required: true,
      // e.g. "Computer Science"
    },
    degree: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Degree',
      // optional link to the parent degree for curriculum suggestions
    },
    creditHours: {
      type: Number,
      required: true,
      // e.g. 3
    },

    // Difficulty & level
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
      // used to match with student skillLevel
    },
    semesterOffered: {
      type: Number,
      // which semester this course is typically taken e.g. 5
    },

    // Prerequisites — which courses must be done before this one
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        // references other Course documents
      },
    ],

    // Tags for content-based filtering
    tags: [
      {
        type: String,
        // e.g. ["AI", "Python", "Data Science", "Machine Learning"]
      },
    ],
    careerOutcomes: [
      {
        type: String,
        // e.g. ["Data Analyst", "ML Engineer", "Research Scientist"]
      },
    ],
    skillsGained: [
      {
        type: String,
        // e.g. ["Python", "TensorFlow", "Statistics"]
      },
    ],

    // Stats used by recommendation engine
    successRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      // % of students who passed with good grade e.g. 85
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
      // student feedback rating
    },
    totalEnrollments: {
      type: Number,
      default: 0,
      // how many students took this course (popularity signal)
    },

    // Marks core/major courses for the linked degree
    isCore: {
      type: Boolean,
      default: false,
    },

    // Course category for degree pathways
    category: {
      type: String,
      enum: ['core', 'foundation', 'elective'],
      default: 'core',
    },

    // Degree-relevant metadata for smarter course suggestions
    relevantSubjects: [{ type: String }],
    skillTags: [{ type: String }],
    careerTags: [{ type: String }],

    isActive: {
      type: Boolean,
      default: true,
      // admin can deactivate courses
    },
  },
  { timestamps: true },
)

courseSchema.index({ degree: 1, isActive: 1, semesterOffered: 1 })
courseSchema.index({ isCore: 1, category: 1 })
courseSchema.index({ tags: 1 })

module.exports = mongoose.model('Course', courseSchema)
