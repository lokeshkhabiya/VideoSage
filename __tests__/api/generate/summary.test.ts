import { NextRequest } from 'next/server';
import { GET } from '@/app/api/generate/summary/route';

// Mock modules
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    userContent: { findUnique: jest.fn() },
    metadata: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    youtubeContent: { findUnique: jest.fn() },
  },
}));

jest.mock('@/lib/utils', () => ({
  summarizeChunks: jest.fn(),
}));

describe('/api/generate/summary', () => {
  let startTime: number;

  beforeEach(() => {
    startTime = performance.now();
    jest.clearAllMocks();
  });

  afterEach(() => {
    const endTime = performance.now();
    console.log(`Test execution time: ${(endTime - startTime).toFixed(2)}ms`);
  });

  const createMockRequest = (searchParams: Record<string, string> = {}, headers: Record<string, string> = {}) => {
    const url = new URL('http://localhost/api/generate/summary');
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const mockRequest = {
      nextUrl: url,
      headers: {
        get: jest.fn((key: string) => headers[key] || null),
      },
    } as unknown as NextRequest;

    return mockRequest;
  };

  describe('GET /api/generate/summary - Generate summary', () => {
    it('should return 403 for missing video_id parameter', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        content_id: 'test-content-id'
        // Missing video_id
      }, {
        'user': JSON.stringify({ user_id: 'test-user-id' })
      });

      const response = await GET(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(403);
      expect(responseData.message).toBe('Please provide video_id and content_id!');
      expect(executionTime).toBeLessThan(50); // Parameter validation should be very fast

      console.log(`✅ Summary missing video_id test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should return 403 for missing content_id parameter', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        video_id: 'dQw4w9WgXcQ'
        // Missing content_id
      }, {
        'user': JSON.stringify({ user_id: 'test-user-id' })
      });

      const response = await GET(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(403);
      expect(responseData.message).toBe('Please provide video_id and content_id!');
      expect(executionTime).toBeLessThan(50);

      console.log(`✅ Summary missing content_id test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should return 401 for unauthorized user', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        video_id: 'dQw4w9WgXcQ',
        content_id: 'test-content-id'
      }, {
        'user': JSON.stringify({ user_id: 'test-user-id' })
      });

      // Mock user content not found
      const prisma = require('@/lib/prisma').default;
      prisma.userContent.findUnique.mockResolvedValue(null);

      const response = await GET(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(401);
      expect(responseData.message).toBe('Content not found for the user! ');
      expect(executionTime).toBeLessThan(100); // Authorization check should be fast

      console.log(`✅ Summary unauthorized test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should return existing summary quickly when available', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        video_id: 'dQw4w9WgXcQ',
        content_id: 'test-content-id'
      }, {
        'user': JSON.stringify({ user_id: 'test-user-id' })
      });

      const prisma = require('@/lib/prisma').default;
      
      // Mock user content exists
      prisma.userContent.findUnique.mockResolvedValue({
        user_id: 'test-user-id',
        content_id: 'test-content-id'
      });

      // Mock existing summary
      prisma.metadata.findUnique.mockResolvedValue({
        youtube_id: 'dQw4w9WgXcQ',
        summary: 'This is an existing summary of the video content.'
      });

      const response = await GET(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(200);
      expect(responseData.message).toBe('Found summary Successfully!');
      expect(responseData.data).toBe('This is an existing summary of the video content.');
      expect(executionTime).toBeLessThan(200); // Retrieving existing summary should be very fast

      console.log(`✅ Summary existing summary test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should generate new summary when none exists', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        video_id: 'dQw4w9WgXcQ',
        content_id: 'test-content-id'
      }, {
        'user': JSON.stringify({ user_id: 'test-user-id' })
      });

      const prisma = require('@/lib/prisma').default;
      
      // Mock user content exists
      prisma.userContent.findUnique.mockResolvedValue({
        user_id: 'test-user-id',
        content_id: 'test-content-id'
      });

      // Mock no existing metadata
      prisma.metadata.findUnique.mockResolvedValue(null);

      // Mock metadata creation
      prisma.metadata.create.mockResolvedValue({
        metadata_id: 'new-metadata-id',
        youtube_id: 'dQw4w9WgXcQ'
      });

      // Mock YouTube content with transcript
      prisma.youtubeContent.findUnique.mockResolvedValue({
        content_id: 'test-content-id',
        youtube_id: 'dQw4w9WgXcQ',
        transcript: [
          { text: 'Hello everyone', startTime: '0', endTime: '2' },
          { text: 'Welcome to my video', startTime: '2', endTime: '5' },
          { text: 'Today we will learn about testing', startTime: '5', endTime: '8' }
        ]
      });

      // Mock summary generation
      const utils = require('@/lib/utils');
      utils.summarizeChunks.mockResolvedValue('This is a generated summary of the video content.');

      // Mock metadata update
      prisma.metadata.update.mockResolvedValue({
        youtube_id: 'dQw4w9WgXcQ',
        summary: 'This is a generated summary of the video content.'
      });

      const response = await GET(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(200);
      expect(responseData.message).toBe('Successfully created summary for content_id: test-content-id and youtube_id: dQw4w9WgXcQ');
      expect(responseData.data).toBe('This is a generated summary of the video content.');
      expect(executionTime).toBeLessThan(3000); // AI generation should be reasonable but can be slower

      console.log(`✅ Summary generation test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should return 404 when no transcript is found', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        video_id: 'dQw4w9WgXcQ',
        content_id: 'test-content-id'
      }, {
        'user': JSON.stringify({ user_id: 'test-user-id' })
      });

      const prisma = require('@/lib/prisma').default;
      
      // Mock user content exists
      prisma.userContent.findUnique.mockResolvedValue({
        user_id: 'test-user-id',
        content_id: 'test-content-id'
      });

      // Mock no existing metadata
      prisma.metadata.findUnique.mockResolvedValue(null);

      // Mock metadata creation
      prisma.metadata.create.mockResolvedValue({
        metadata_id: 'new-metadata-id',
        youtube_id: 'dQw4w9WgXcQ'
      });

      // Mock YouTube content without transcript
      prisma.youtubeContent.findUnique.mockResolvedValue({
        content_id: 'test-content-id',
        youtube_id: 'dQw4w9WgXcQ',
        transcript: null
      });

      const response = await GET(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(404);
      expect(responseData.message).toBe('No transcript found for this video');
      expect(executionTime).toBeLessThan(500);

      console.log(`✅ Summary no transcript test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should handle AI generation failures gracefully', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        video_id: 'dQw4w9WgXcQ',
        content_id: 'test-content-id'
      }, {
        'user': JSON.stringify({ user_id: 'test-user-id' })
      });

      const prisma = require('@/lib/prisma').default;
      
      // Mock user content exists
      prisma.userContent.findUnique.mockResolvedValue({
        user_id: 'test-user-id',
        content_id: 'test-content-id'
      });

      // Mock no existing metadata
      prisma.metadata.findUnique.mockResolvedValue(null);

      // Mock metadata creation
      prisma.metadata.create.mockResolvedValue({
        metadata_id: 'new-metadata-id',
        youtube_id: 'dQw4w9WgXcQ'
      });

      // Mock YouTube content with transcript
      prisma.youtubeContent.findUnique.mockResolvedValue({
        content_id: 'test-content-id',
        youtube_id: 'dQw4w9WgXcQ',
        transcript: [
          { text: 'Hello everyone', startTime: '0', endTime: '2' }
        ]
      });

      // Mock summary generation failure
      const utils = require('@/lib/utils');
      utils.summarizeChunks.mockResolvedValue(null);

      const response = await GET(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(500);
      expect(responseData.message).toBe('Could not generate summary');
      expect(executionTime).toBeLessThan(2000);

      console.log(`✅ Summary AI failure test completed in ${executionTime.toFixed(2)}ms`);
    });
  });

  describe('Performance benchmarks', () => {
    it('should meet performance requirements for summary operations', async () => {
      const iterations = 5;
      const existingSummaryTimes: number[] = [];
      const newSummaryTimes: number[] = [];

      const prisma = require('@/lib/prisma').default;
      
      // Test existing summary retrieval performance
      for (let i = 0; i < iterations; i++) {
        const testStart = performance.now();

        const req = createMockRequest({
          video_id: `test${i}`,
          content_id: `test-content-${i}`
        }, {
          'user': JSON.stringify({ user_id: 'test-user-id' })
        });

        // Mock user content exists
        prisma.userContent.findUnique.mockResolvedValue({
          user_id: 'test-user-id',
          content_id: `test-content-${i}`
        });

        // Mock existing summary
        prisma.metadata.findUnique.mockResolvedValue({
          youtube_id: `test${i}`,
          summary: `Existing summary for video ${i}`
        });

        await GET(req);

        const testEnd = performance.now();
        existingSummaryTimes.push(testEnd - testStart);
      }

      // Test new summary generation performance
      for (let i = 0; i < 3; i++) { // Fewer iterations for generation
        const testStart = performance.now();

        const req = createMockRequest({
          video_id: `new${i}`,
          content_id: `new-content-${i}`
        }, {
          'user': JSON.stringify({ user_id: 'test-user-id' })
        });

        // Mock user content exists
        prisma.userContent.findUnique.mockResolvedValue({
          user_id: 'test-user-id',
          content_id: `new-content-${i}`
        });

        // Mock no existing metadata
        prisma.metadata.findUnique.mockResolvedValue(null);
        prisma.metadata.create.mockResolvedValue({});

        // Mock YouTube content
        prisma.youtubeContent.findUnique.mockResolvedValue({
          transcript: [{ text: 'Test transcript', startTime: '0', endTime: '1' }]
        });

        // Mock summary generation
        const utils = require('@/lib/utils');
        utils.summarizeChunks.mockResolvedValue(`Generated summary ${i}`);

        await GET(req);

        const testEnd = performance.now();
        newSummaryTimes.push(testEnd - testStart);
      }

      const existingAvg = existingSummaryTimes.reduce((a, b) => a + b, 0) / existingSummaryTimes.length;
      const newAvg = newSummaryTimes.reduce((a, b) => a + b, 0) / newSummaryTimes.length;

      console.log(`📊 Performance metrics for summary generation:
        Existing summary retrieval:
        - Average: ${existingAvg.toFixed(2)}ms
        - Maximum: ${Math.max(...existingSummaryTimes).toFixed(2)}ms
        
        New summary generation:
        - Average: ${newAvg.toFixed(2)}ms
        - Maximum: ${Math.max(...newSummaryTimes).toFixed(2)}ms`);

      expect(existingAvg).toBeLessThan(100); // Existing summaries should be very fast
      expect(newAvg).toBeLessThan(3000); // New summaries can take longer due to AI processing
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        video_id: 'dQw4w9WgXcQ',
        content_id: 'test-content-id'
      }, {
        'user': JSON.stringify({ user_id: 'test-user-id' })
      });

      // Mock database error
      const prisma = require('@/lib/prisma').default;
      prisma.userContent.findUnique.mockRejectedValue(new Error('Database connection failed'));

      const response = await GET(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(500);
      expect(responseData.message).toBe('Error while generating summary content!');
      expect(executionTime).toBeLessThan(1000);

      console.log(`✅ Summary database error test completed in ${executionTime.toFixed(2)}ms`);
    });
  });
}); 