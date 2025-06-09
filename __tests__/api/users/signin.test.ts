import { NextRequest } from 'next/server';
import { POST } from '@/app/api/users/signin/route';

// Mock modules before importing them
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

// Import mocked modules
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('/api/users/signin', () => {
  let startTime: number;

  beforeEach(() => {
    startTime = performance.now();
    jest.clearAllMocks();
  });

  afterEach(() => {
    const endTime = performance.now();
    console.log(`Test execution time: ${(endTime - startTime).toFixed(2)}ms`);
  });

  const mockUser = {
    user_id: 'test-user-id-123',
    username: 'lokeshkhabiya0022@gmail.com',
    first_name: 'Lokesh',
    last_name: 'Khabiya',
    password: 'hashed-password',
    created_at: new Date('2024-01-01'),
  };

  const createMockRequest = (body: any) => {
    return {
      json: async () => body,
    } as NextRequest;
  };

  describe('Successful signin', () => {
    it('should successfully sign in user with valid credentials', async () => {
      const testStart = performance.now();

      // Mock implementations
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockJwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      const req = createMockRequest({
        username: 'lokeshkhabiya0022@gmail.com',
        password: 'Igris123',
      });

      const response = await POST(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(200);
      expect(responseData.message).toBe('Login Successfull!');
      expect(responseData.user).toEqual({
        user_id: mockUser.user_id,
        username: mockUser.username,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        created_at: mockUser.created_at,
      });
      expect(responseData.token).toBe('mock-jwt-token');

      // Performance assertions
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
      
      // Verify mocks were called correctly
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'lokeshkhabiya0022@gmail.com' }
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith('Igris123', 'hashed-password');
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          user_id: mockUser.user_id,
          username: mockUser.username,
          first_name: mockUser.first_name,
          last_name: mockUser.last_name,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      console.log(`✅ Signin success test completed in ${executionTime.toFixed(2)}ms`);
    });
  });

  describe('Failed signin attempts', () => {
    it('should return 401 for non-existent user', async () => {
      const testStart = performance.now();

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const req = createMockRequest({
        username: 'nonexistent@example.com',
        password: 'password123',
      });

      const response = await POST(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(401);
      expect(responseData.message).toBe('Invalid username or password!');

      expect(executionTime).toBeLessThan(500); // Failed auth should be quick
      console.log(`✅ Signin failure (user not found) test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should return 401 for incorrect password', async () => {
      const testStart = performance.now();

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false);

      const req = createMockRequest({
        username: 'lokeshkhabiya0022@gmail.com',
        password: 'wrongpassword',
      });

      const response = await POST(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(401);
      expect(responseData.message).toBe('Invalid username or password!');

      expect(executionTime).toBeLessThan(500);
      console.log(`✅ Signin failure (wrong password) test completed in ${executionTime.toFixed(2)}ms`);
    });
  });

  describe('Input validation', () => {
    it('should return 400 for invalid input format', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        username: 'ab', // Too short
        password: '123', // Too short
      });

      const response = await POST(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(400);
      expect(responseData.message).toBe('Validation error');
      expect(responseData.errors).toBeDefined();

      expect(executionTime).toBeLessThan(100); // Validation should be very fast
      console.log(`✅ Signin validation test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should return 400 for missing fields', async () => {
      const testStart = performance.now();

      const req = createMockRequest({
        username: 'lokeshkhabiya0022@gmail.com',
        // password missing
      });

      const response = await POST(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(400);
      expect(responseData.message).toBe('Validation error');

      expect(executionTime).toBeLessThan(100);
      console.log(`✅ Signin missing fields test completed in ${executionTime.toFixed(2)}ms`);
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      const testStart = performance.now();

      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database connection failed'));

      const req = createMockRequest({
        username: 'lokeshkhabiya0022@gmail.com',
        password: 'Igris123',
      });

      const response = await POST(req);
      const responseData = await response.json();

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(response.status).toBe(500);
      expect(responseData.message).toBe('Error while signin');

      expect(executionTime).toBeLessThan(1000);
      console.log(`✅ Signin database error test completed in ${executionTime.toFixed(2)}ms`);
    });
  });

  describe('Performance benchmarks', () => {
    it('should meet performance requirements for high load', async () => {
      const iterations = 10;
      const executionTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const testStart = performance.now();

        mockPrisma.user.findUnique.mockResolvedValue(mockUser);
        mockBcrypt.compare.mockResolvedValue(true);
        mockJwt.sign.mockReturnValue('mock-jwt-token');

        const req = createMockRequest({
          username: 'lokeshkhabiya0022@gmail.com',
          password: 'Igris123',
        });

        await POST(req);

        const testEnd = performance.now();
        executionTimes.push(testEnd - testStart);
      }

      const avgTime = executionTimes.reduce((a, b) => a + b, 0) / iterations;
      const maxTime = Math.max(...executionTimes);
      const minTime = Math.min(...executionTimes);

      console.log(`📊 Performance metrics for signin:
        - Average: ${avgTime.toFixed(2)}ms
        - Maximum: ${maxTime.toFixed(2)}ms
        - Minimum: ${minTime.toFixed(2)}ms
        - Total iterations: ${iterations}`);

      expect(avgTime).toBeLessThan(100); // Average should be under 100ms
      expect(maxTime).toBeLessThan(500); // Max should be under 500ms
    });
  });
}); 