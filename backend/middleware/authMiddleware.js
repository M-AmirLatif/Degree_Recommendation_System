const jwt = require('jsonwebtoken')
const Student = require('../models/Student')
const { getTokenFromRequest } = require('../utils/authCookies')

const protect = async (req, res, next) => {
  const token = getTokenFromRequest(req)

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.student = await Student.findById(decoded.id).select('-password')
      if (!req.student) {
        return res.status(401).json({ message: 'Not authorized, user not found' })
      }
      next()
      return
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' })
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token' })
}

const optionalAuth = async (req, res, next) => {
  const token = getTokenFromRequest(req)

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.student = await Student.findById(decoded.id).select('-password')
    } catch (error) {
      // ignore invalid token for optional auth
    }
  }
  next()
}

module.exports = protect
module.exports.protect = protect
module.exports.optionalAuth = optionalAuth
