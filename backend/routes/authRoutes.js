const express = require('express')
const router = express.Router()
const {
  registerStudent,
  loginStudent,
  logoutStudent,
  getProfile,
  makeAdmin,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController')

const protect = require('../middleware/authMiddleware')
const isAdmin = require('../middleware/adminMiddleware')
const {
  validateRegister,
  validateLogin,
} = require('../middleware/validateMiddleware')
const {
  validate,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../middleware/zodValidator')

// Public routes
router.post('/register', validateRegister, registerStudent)
router.post('/login', validateLogin, loginStudent)
router.post('/logout', logoutStudent)
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema), resetPassword)

// Protected routes
router.get('/profile', protect, getProfile)
router.put('/make-admin/:id', protect, isAdmin, makeAdmin)

module.exports = router
