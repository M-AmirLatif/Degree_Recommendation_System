const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const hpp = require('hpp')
const rateLimit = require('express-rate-limit')
const mongoose = require('mongoose')
const { validateEnv } = require('./config/env')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const requestLogger = require('./middleware/requestLogger')

const config = validateEnv()
const app = express()
const isDev = config.nodeEnv !== 'production'

const isLocalOrigin = (origin) =>
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true)
      return
    }

    if (isDev && isLocalOrigin(origin)) {
      callback(null, true)
      return
    }

    if (config.corsOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.apiRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: config.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
})

app.set('trust proxy', 1)
app.disable('x-powered-by')

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
)
app.use(compression())
app.use(hpp())
app.use(cors(corsOptions))
app.use(requestLogger)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use('/api', apiLimiter)
app.use('/api/auth', authLimiter)

app.get('/health', (req, res) => {
  const connectionStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }

  res.json({
    status: mongoose.connection.readyState === 1 ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    database: connectionStates[mongoose.connection.readyState] || 'unknown',
  })
})

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/courses', require('./routes/courseRoutes'))
app.use('/api/recommendations', require('./routes/recommendationRoutes'))
app.use('/api/preferences', require('./routes/preferenceRoutes'))
app.use('/api/admin', require('./routes/adminRoutes'))
app.use('/api/degrees', require('./routes/degreeRoutes'))
app.use('/api/degree-enrollments', require('./routes/degreeEnrollmentRoutes'))

const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.get('/', (req, res) => {
  res.json({
    message: 'Degree Recommender API is running',
    status: 'healthy',
    docs: '/api/docs',
    health: '/health',
  })
})


app.use(notFound)
app.use(errorHandler)

module.exports = app
