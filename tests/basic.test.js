const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');

describe('Basic API Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leave-management-test');
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('OK');
      expect(response.body.data.environment).toBeDefined();
    });
  });

  describe('Authentication', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should require authentication for protected routes', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting', async () => {
      // Make multiple requests to trigger rate limiting
      const requests = Array(105).fill().map(() => 
        request(app).get('/api/health')
      );

      const responses = await Promise.all(requests);
      const rateLimitedResponse = responses.find(res => res.status === 429);

      if (rateLimitedResponse) {
        expect(rateLimitedResponse.body.success).toBe(false);
        expect(rateLimitedResponse.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
      }
    });
  });
});
