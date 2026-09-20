const request = require('supertest')

jest.setTimeout(15000)

describe('app health routes', () => {

  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      MONGO_URI: 'mongodb://localhost:27017/testdb',
      JWT_SECRET: '12345678901234567890123456789012',
      CORS_ORIGINS: 'http://localhost:5500',
    }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  test('returns health response', async () => {
    const app = require('../app')
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.headers['x-request-id']).toEqual(expect.any(String))
    expect(response.body).toEqual(
      expect.objectContaining({
        status: expect.any(String),
        database: expect.any(String),
        environment: 'test',
      }),
    )
  })

  test('returns API root response', async () => {
    const app = require('../app')
    const response = await request(app).get('/')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Degree Recommender API is running',
        status: 'healthy',
      }),
    )
  })
})
