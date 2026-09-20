const express = require('express')
const router = express.Router()
const {
  getRecommendations,
  getAiAdvice,
  getDegreeRoadmap,
} = require('../controllers/recommendationController')
const protect = require('../middleware/authMiddleware')

router.get('/', protect, getRecommendations)
router.post('/ai-advisor', protect, getAiAdvice)
router.get('/:degreeId/roadmap', protect, getDegreeRoadmap)

module.exports = router
