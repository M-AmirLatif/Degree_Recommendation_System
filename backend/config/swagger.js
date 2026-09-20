const swaggerJsDoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Degree Recommendation System API',
      version: '2.0.0',
      description: 'Comprehensive, AI-powered Degree & Career Pathway Recommendation API with real-time academic stream matching, collaborative filtering, and interactive comparison tools.',
      contact: {
        name: 'Degree Recommender Support',
        email: 'support@degreerecommender.com',
      },
    },
    servers: [
      {
        url: '/',
        description: 'Current Environment Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'],
}

const swaggerSpec = swaggerJsDoc(options)

module.exports = swaggerSpec
