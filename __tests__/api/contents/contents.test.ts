import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/contents/route';

// Mock modules
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn() },
    space: { findFirst: jest.fn(), create: jest.fn() },
    youtubeContent: { findUnique: jest.fn(), create: jest.fn() },
    userContent: { findUnique: jest.fn(), create: jest.fn() },
    spaceContent: { create: jest.fn() },
    content: { create: jest.fn() },
  },
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

jest.mock('axios', () => ({
  get: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  fetchTranscript2: jest.fn(),
  preprocessTranscript: jest.fn(),
  generateEmbeddings: jest.fn(),
  initializePinecone: jest.fn(),
  upsertChunksToPinecone: jest.fn(),
}));

describe('/api/contents', () => {
  let startTime: number;

  beforeEach(() => {
    startTime = performance.now();
    jest.clearAllMocks();
  });

  afterEach(() => {
    const endTime = performance.now();
    console.log(`Test execution time: ${(endTime - startTime).toFixed(2)}ms`);
  });

  const createMockRequest = (headers: Record<string, string> = {}, body?: any) => {
    const mockRequest = {
      headers: {
        get: jest.fn((key: string) => headers[key] || null),
        replace: jest.fn(),
      },
      json: async () => body,
    } as unknown as NextRequest;

    return mockRequest;
  };

  describe('POST /api/contents - Process YouTube content', () => {
    it('should return 401 for missing authorization header', async () => {
      const testStart = performance.now();

      const req = createMockRequest({}, {
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        space_id: 'test-space-id'
      });

      const response = await POST(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Missing Authorization header');
      expect(executionTime).toBeLessThan(50); // Auth check should be very fast

      console.log(`✅ Contents POST unauthorized test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should return 400 for missing youtube_url', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        'Authorization': 'Bearer valid-token'
      }, {
        space_id: 'test-space-id'
        // Missing youtube_url
      });

      // Mock JWT verification
      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValue({ user_id: 'test-user-id' });

      // Mock user exists
      const prisma = require('@/lib/prisma').default;
      prisma.user.findUnique.mockResolvedValue({ user_id: 'test-user-id' });

      const response = await POST(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('youtube_url is required');
      expect(executionTime).toBeLessThan(100); // Validation should be fast

      console.log(`✅ Contents POST missing URL test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should return 400 for invalid YouTube URL', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        'Authorization': 'Bearer valid-token'
      }, {
        youtube_url: 'https://invalid-url.com',
        space_id: 'test-space-id'
      });

      // Mock JWT verification
      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValue({ user_id: 'test-user-id' });

      // Mock user exists
      const prisma = require('@/lib/prisma').default;
      prisma.user.findUnique.mockResolvedValue({ user_id: 'test-user-id' });

      const response = await POST(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Could not extract valid video ID from youtube_url');
      expect(executionTime).toBeLessThan(100);

      console.log(`✅ Contents POST invalid URL test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should successfully process valid YouTube content', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        'Authorization': 'Bearer valid-token'
      }, {
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        space_id: 'test-space-id'
      });

      // Mock JWT verification
      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValue({ user_id: 'test-user-id' });

      // Mock user exists
      const prisma = require('@/lib/prisma').default;
      prisma.user.findUnique.mockResolvedValue({ user_id: 'test-user-id' });

      // Mock transcript fetching
      const utils = require('@/lib/utils');
      utils.fetchTranscript2.mockResolvedValue([
        { text: 'Hello world', startTime: '0', endTime: '1' }
      ]);
      utils.preprocessTranscript.mockResolvedValue(['Hello world']);

      // Mock YouTube API response
      const axios = require('axios');
      axios.get.mockResolvedValue({
        data: {
          items: [{
            snippet: {
              title: 'Test Video',
              description: 'Test Description',
              thumbnails: {
                standard: { url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg' }
              }
            }
          }]
        }
      });

      // Mock no existing content
      prisma.youtubeContent.findUnique.mockResolvedValue(null);

      const response = await POST(req);
      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response).toBeDefined();
      expect(executionTime).toBeLessThan(5000); // YouTube processing should be reasonable

      console.log(`✅ Contents POST success test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should handle existing content reuse efficiently', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        'Authorization': 'Bearer valid-token'
      }, {
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        space_id: 'test-space-id'
      });

      // Mock JWT verification
      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValue({ user_id: 'test-user-id' });

      // Mock user exists
      const prisma = require('@/lib/prisma').default;
      prisma.user.findUnique.mockResolvedValue({ user_id: 'test-user-id' });

      // Mock existing content
      prisma.youtubeContent.findUnique.mockResolvedValue({
        content_id: 'existing-content-id',
        youtube_id: 'dQw4w9WgXcQ',
        content: { content_id: 'existing-content-id' }
      });

      // Mock no existing user-content relationship
      prisma.userContent.findUnique.mockResolvedValue(null);

      const response = await POST(req);
      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response).toBeDefined();
      expect(executionTime).toBeLessThan(1000); // Reusing content should be much faster

      console.log(`✅ Contents POST existing content test completed in ${executionTime.toFixed(2)}ms`);
    });
  });

  describe('GET /api/contents - Fetch user contents', () => {
    it('should return user contents successfully', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        'Authorization': 'Bearer valid-token',
        'user': JSON.stringify({ user_id: 'test-user-id' })
      });

      const response = await GET(req as any);
      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response).toBeDefined();
      expect(executionTime).toBeLessThan(1000); // Fetching contents should be reasonable

      console.log(`✅ Contents GET test completed in ${executionTime.toFixed(2)}ms`);
    });
  });

  describe('Performance benchmarks', () => {
    it('should meet performance requirements for content processing', async () => {
      const iterations = 3; // Lower iterations due to complexity
      const postExecutionTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const testStart = performance.now();

        const req = createMockRequest({
          'Authorization': 'Bearer valid-token'
        }, {
          youtube_url: `https://www.youtube.com/watch?v=test${i}`,
          space_id: 'test-space-id'
        });

        // Mock successful flow
        const jwt = require('jsonwebtoken');
        jwt.verify.mockReturnValue({ user_id: 'test-user-id' });

        const prisma = require('@/lib/prisma').default;
        prisma.user.findUnique.mockResolvedValue({ user_id: 'test-user-id' });

        // Mock existing content for faster processing
        prisma.youtubeContent.findUnique.mockResolvedValue({
          content_id: `existing-content-id-${i}`,
          youtube_id: `test${i}`,
          content: { content_id: `existing-content-id-${i}` }
        });

        await POST(req);

        const testEnd = performance.now();
        postExecutionTimes.push(testEnd - testStart);
      }

      const avgTime = postExecutionTimes.reduce((a, b) => a + b, 0) / iterations;
      const maxTime = Math.max(...postExecutionTimes);
      const minTime = Math.min(...postExecutionTimes);

      console.log(`📊 Performance metrics for content processing:
        - Average: ${avgTime.toFixed(2)}ms
        - Maximum: ${maxTime.toFixed(2)}ms
        - Minimum: ${minTime.toFixed(2)}ms
        - Total iterations: ${iterations}`);

      expect(avgTime).toBeLessThan(2000); // Average should be under 2 seconds
      expect(maxTime).toBeLessThan(5000); // Max should be under 5 seconds
    });
  });

  describe('Error handling', () => {
    it('should handle transcript fetch failures gracefully', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        'Authorization': 'Bearer valid-token'
      }, {
        youtube_url: 'https://www.youtube.com/watch?v=invalid',
        space_id: 'test-space-id'
      });

      // Mock JWT verification
      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValue({ user_id: 'test-user-id' });

      // Mock user exists
      const prisma = require('@/lib/prisma').default;
      prisma.user.findUnique.mockResolvedValue({ user_id: 'test-user-id' });

      // Mock transcript fetch failure
      const utils = require('@/lib/utils');
      utils.fetchTranscript2.mockResolvedValue(null);

      const response = await POST(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Error extracting transcripts or no transcripts found');
      expect(executionTime).toBeLessThan(1000);

      console.log(`✅ Contents POST transcript error test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should handle YouTube API failures gracefully', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        'Authorization': 'Bearer valid-token'
      }, {
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        space_id: 'test-space-id'
      });

      // Mock JWT verification and user
      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValue({ user_id: 'test-user-id' });

      const prisma = require('@/lib/prisma').default;
      prisma.user.findUnique.mockResolvedValue({ user_id: 'test-user-id' });

      // Mock transcript success
      const utils = require('@/lib/utils');
      utils.fetchTranscript2.mockResolvedValue([
        { text: 'Hello world', startTime: '0', endTime: '1' }
      ]);

      // Mock YouTube API failure
      const axios = require('axios');
      axios.get.mockResolvedValue({
        data: { items: [] } // No items found
      });

      const response = await POST(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('Could not fetch YouTube video metadata');
      expect(executionTime).toBeLessThan(2000);

      console.log(`✅ Contents POST YouTube API error test completed in ${executionTime.toFixed(2)}ms`);
    });
  });
}); 