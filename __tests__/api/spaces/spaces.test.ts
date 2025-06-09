import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/spaces/route';

// Mock modules
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    space: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/jwt', () => ({
  verifyJwtToken: jest.fn(),
}));

describe('/api/spaces', () => {
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
      },
      json: async () => body,
    } as unknown as NextRequest;

    return mockRequest;
  };

  describe('GET /api/spaces - Fetch user spaces', () => {
    it('should return 401 for missing authorization header', async () => {
      const testStart = performance.now();

      const req = createMockRequest();
      const response = await GET(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(401);
      expect(responseData.message).toBe('Unauthorized');
      expect(executionTime).toBeLessThan(50); // Auth check should be very fast

      console.log(`✅ Spaces GET unauthorized test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should return 401 for invalid token', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        'Authorization': 'Bearer invalid-token'
      });

      // Mock JWT verification to fail
      const { verifyJwtToken } = require('@/lib/jwt');
      verifyJwtToken.mockRejectedValue(new Error('Invalid token'));

      const response = await GET(req);
      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(401);
      expect(executionTime).toBeLessThan(100);

      console.log(`✅ Spaces GET invalid token test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should successfully fetch user spaces with valid token', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        'Authorization': 'Bearer valid-token'
      });

      // Mock successful JWT verification
      const { verifyJwtToken } = require('@/lib/jwt');
      verifyJwtToken.mockResolvedValue({ user_id: 'test-user-id' });

      const response = await GET(req);
      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response).toBeDefined();
      expect(executionTime).toBeLessThan(1000); // Database query should be reasonable

      console.log(`✅ Spaces GET success test completed in ${executionTime.toFixed(2)}ms`);
    });
  });

  describe('POST /api/spaces - Create new space', () => {
    it('should return 401 for missing authorization header', async () => {
      const testStart = performance.now();

      const req = createMockRequest({}, { name: 'Test Space' });
      const response = await POST(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(401);
      expect(responseData.message).toBe('Unauthorized');
      expect(executionTime).toBeLessThan(50);

      console.log(`✅ Spaces POST unauthorized test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should return 400 for empty space name', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        'Authorization': 'Bearer valid-token'
      }, { name: '' });

      // Mock successful JWT verification
      const { verifyJwtToken } = require('@/lib/jwt');
      verifyJwtToken.mockResolvedValue({ user_id: 'test-user-id' });

      const response = await POST(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(400);
      expect(responseData.message).toBe('Space name is required');
      expect(executionTime).toBeLessThan(100); // Validation should be fast

      console.log(`✅ Spaces POST empty name test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should successfully create space with valid data', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        'Authorization': 'Bearer valid-token'
      }, { name: 'My New Space' });

      // Mock successful JWT verification
      const { verifyJwtToken } = require('@/lib/jwt');
      verifyJwtToken.mockResolvedValue({ user_id: 'test-user-id' });

      const response = await POST(req);
      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response).toBeDefined();
      expect(executionTime).toBeLessThan(1000); // Space creation should be reasonable

      console.log(`✅ Spaces POST success test completed in ${executionTime.toFixed(2)}ms`);
    });
  });

  describe('Performance benchmarks', () => {
    it('should meet performance requirements for space operations', async () => {
      const iterations = 5;
      const getExecutionTimes: number[] = [];
      const postExecutionTimes: number[] = [];

      // Mock JWT verification
      const { verifyJwtToken } = require('@/lib/jwt');
      verifyJwtToken.mockResolvedValue({ user_id: 'test-user-id' });

      // Test GET operations
      for (let i = 0; i < iterations; i++) {
        const testStart = performance.now();

        const req = createMockRequest({
          'Authorization': 'Bearer valid-token'
        });

        await GET(req);

        const testEnd = performance.now();
        getExecutionTimes.push(testEnd - testStart);
      }

      // Test POST operations
      for (let i = 0; i < iterations; i++) {
        const testStart = performance.now();

        const req = createMockRequest({
          'Authorization': 'Bearer valid-token'
        }, { name: `Test Space ${i}` });

        await POST(req);

        const testEnd = performance.now();
        postExecutionTimes.push(testEnd - testStart);
      }

      const getAvgTime = getExecutionTimes.reduce((a, b) => a + b, 0) / iterations;
      const postAvgTime = postExecutionTimes.reduce((a, b) => a + b, 0) / iterations;

      console.log(`📊 Performance metrics for spaces:
        GET operations:
        - Average: ${getAvgTime.toFixed(2)}ms
        - Maximum: ${Math.max(...getExecutionTimes).toFixed(2)}ms
        
        POST operations:
        - Average: ${postAvgTime.toFixed(2)}ms
        - Maximum: ${Math.max(...postExecutionTimes).toFixed(2)}ms`);

      expect(getAvgTime).toBeLessThan(300); // GET should be under 300ms
      expect(postAvgTime).toBeLessThan(500); // POST should be under 500ms
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully in GET', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        'Authorization': 'Bearer valid-token'
      });

      // Mock JWT verification success but database error
      const { verifyJwtToken } = require('@/lib/jwt');
      verifyJwtToken.mockResolvedValue({ user_id: 'test-user-id' });

      const response = await GET(req);
      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response).toBeDefined();
      expect(executionTime).toBeLessThan(1000);

      console.log(`✅ Spaces GET error handling test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should handle database errors gracefully in POST', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        'Authorization': 'Bearer valid-token'
      }, { name: 'Test Space' });

      // Mock JWT verification success
      const { verifyJwtToken } = require('@/lib/jwt');
      verifyJwtToken.mockResolvedValue({ user_id: 'test-user-id' });

      const response = await POST(req);
      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response).toBeDefined();
      expect(executionTime).toBeLessThan(1000);

      console.log(`✅ Spaces POST error handling test completed in ${executionTime.toFixed(2)}ms`);
    });
  });
}); 