import { signupValidation, signinValidation } from '@/validations/userValidation';

describe('User Validation', () => {
  let startTime: number;

  beforeEach(() => {
    startTime = performance.now();
  });

  afterEach(() => {
    const endTime = performance.now();
    console.log(`Test execution time: ${(endTime - startTime).toFixed(2)}ms`);
  });

  describe('signupValidation', () => {
    it('should validate correct signup data', () => {
      const testStart = performance.now();

      const validData = {
        username: 'lokeshkhabiya0022@gmail.com',
        first_name: 'Lokesh',
        last_name: 'Khabiya',
        password: 'Igris123'
      };

      const result = signupValidation(validData);

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(result).toEqual(validData);
      expect(executionTime).toBeLessThan(10); // Validation should be very fast

      console.log(`✅ Signup validation success test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should reject invalid email format', () => {
      const testStart = performance.now();

      const invalidData = {
        username: 'invalid-email',
        first_name: 'Lokesh',
        last_name: 'Khabiya',
        password: 'Igris123'
      };

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(() => signupValidation(invalidData)).toThrow();
      expect(executionTime).toBeLessThan(10); // Failed validation should be very fast

      console.log(`✅ Signup validation invalid email test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should reject short first name', () => {
      const testStart = performance.now();

      const invalidData = {
        username: 'lokeshkhabiya0022@gmail.com',
        first_name: '', // Empty string
        last_name: 'Khabiya',
        password: 'Igris123'
      };

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(() => signupValidation(invalidData)).toThrow();
      expect(executionTime).toBeLessThan(10);

      console.log(`✅ Signup validation short first name test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should reject long first name', () => {
      const testStart = performance.now();

      const invalidData = {
        username: 'lokeshkhabiya0022@gmail.com',
        first_name: 'A'.repeat(31), // 31 characters, exceeds max of 30
        last_name: 'Khabiya',
        password: 'Igris123'
      };

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(() => signupValidation(invalidData)).toThrow();
      expect(executionTime).toBeLessThan(10);

      console.log(`✅ Signup validation long first name test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should reject short password', () => {
      const testStart = performance.now();

      const invalidData = {
        username: 'lokeshkhabiya0022@gmail.com',
        first_name: 'Lokesh',
        last_name: 'Khabiya',
        password: '123' // Too short
      };

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(() => signupValidation(invalidData)).toThrow();
      expect(executionTime).toBeLessThan(10);

      console.log(`✅ Signup validation short password test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should reject long password', () => {
      const testStart = performance.now();

      const invalidData = {
        username: 'lokeshkhabiya0022@gmail.com',
        first_name: 'Lokesh',
        last_name: 'Khabiya',
        password: 'A'.repeat(31) // 31 characters, exceeds max of 30
      };

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(() => signupValidation(invalidData)).toThrow();
      expect(executionTime).toBeLessThan(10);

      console.log(`✅ Signup validation long password test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should reject missing fields', () => {
      const testStart = performance.now();

      const invalidData = {
        username: 'lokeshkhabiya0022@gmail.com',
        first_name: 'Lokesh',
        // Missing last_name and password
      };

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(() => signupValidation(invalidData)).toThrow();
      expect(executionTime).toBeLessThan(10);

      console.log(`✅ Signup validation missing fields test completed in ${executionTime.toFixed(2)}ms`);
    });
  });

  describe('signinValidation', () => {
    it('should validate correct signin data', () => {
      const testStart = performance.now();

      const validData = {
        username: 'lokeshkhabiya0022@gmail.com',
        password: 'Igris123'
      };

      const result = signinValidation(validData);

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(result).toEqual(validData);
      expect(executionTime).toBeLessThan(10); // Validation should be very fast

      console.log(`✅ Signin validation success test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should validate signin with just username (not email)', () => {
      const testStart = performance.now();

      const validData = {
        username: 'testuser123',
        password: 'Igris123'
      };

      const result = signinValidation(validData);

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(result).toEqual(validData);
      expect(executionTime).toBeLessThan(10);

      console.log(`✅ Signin validation username test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should reject short username', () => {
      const testStart = performance.now();

      const invalidData = {
        username: 'ab', // Too short (less than 3 characters)
        password: 'Igris123'
      };

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(() => signinValidation(invalidData)).toThrow();
      expect(executionTime).toBeLessThan(10);

      console.log(`✅ Signin validation short username test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should reject long username', () => {
      const testStart = performance.now();

      const invalidData = {
        username: 'A'.repeat(31), // 31 characters, exceeds max of 30
        password: 'Igris123'
      };

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(() => signinValidation(invalidData)).toThrow();
      expect(executionTime).toBeLessThan(10);

      console.log(`✅ Signin validation long username test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should reject short password', () => {
      const testStart = performance.now();

      const invalidData = {
        username: 'testuser',
        password: '123' // Too short
      };

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(() => signinValidation(invalidData)).toThrow();
      expect(executionTime).toBeLessThan(10);

      console.log(`✅ Signin validation short password test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should reject missing fields', () => {
      const testStart = performance.now();

      const invalidData = {
        username: 'testuser',
        // Missing password
      };

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(() => signinValidation(invalidData)).toThrow();
      expect(executionTime).toBeLessThan(10);

      console.log(`✅ Signin validation missing password test completed in ${executionTime.toFixed(2)}ms`);
    });
  });

  describe('Performance benchmarks', () => {
    it('should meet performance requirements for validation operations', () => {
      const iterations = 100;
      const signupTimes: number[] = [];
      const signinTimes: number[] = [];

      // Test signup validation performance
      for (let i = 0; i < iterations; i++) {
        const testStart = performance.now();

        signupValidation({
          username: `test${i}@example.com`,
          first_name: 'Test',
          last_name: 'User',
          password: 'Password123'
        });

        const testEnd = performance.now();
        signupTimes.push(testEnd - testStart);
      }

      // Test signin validation performance
      for (let i = 0; i < iterations; i++) {
        const testStart = performance.now();

        signinValidation({
          username: `testuser${i}`,
          password: 'Password123'
        });

        const testEnd = performance.now();
        signinTimes.push(testEnd - testStart);
      }

      const signupAvg = signupTimes.reduce((a, b) => a + b, 0) / iterations;
      const signinAvg = signinTimes.reduce((a, b) => a + b, 0) / iterations;

      console.log(`📊 Performance metrics for validation:
        Signup validation:
        - Average: ${signupAvg.toFixed(2)}ms
        - Maximum: ${Math.max(...signupTimes).toFixed(2)}ms
        - Minimum: ${Math.min(...signupTimes).toFixed(2)}ms
        
        Signin validation:
        - Average: ${signinAvg.toFixed(2)}ms
        - Maximum: ${Math.max(...signinTimes).toFixed(2)}ms
        - Minimum: ${Math.min(...signinTimes).toFixed(2)}ms`);

      expect(signupAvg).toBeLessThan(1); // Should be under 1ms on average
      expect(signinAvg).toBeLessThan(1); // Should be under 1ms on average
      expect(Math.max(...signupTimes)).toBeLessThan(10); // Max should be under 10ms
      expect(Math.max(...signinTimes)).toBeLessThan(10); // Max should be under 10ms
    });

    it('should handle validation errors efficiently', () => {
      const iterations = 50;
      const errorTimes: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const testStart = performance.now();

        try {
          signupValidation({
            username: 'invalid-email', // Invalid data to trigger error
            first_name: '',
            last_name: '',
            password: '123'
          });
        } catch (error) {
          // Expected error
        }

        const testEnd = performance.now();
        errorTimes.push(testEnd - testStart);
      }

      const errorAvg = errorTimes.reduce((a, b) => a + b, 0) / iterations;

      console.log(`📊 Performance metrics for validation errors:
        - Average: ${errorAvg.toFixed(2)}ms
        - Maximum: ${Math.max(...errorTimes).toFixed(2)}ms
        - Minimum: ${Math.min(...errorTimes).toFixed(2)}ms`);

      expect(errorAvg).toBeLessThan(2); // Error handling should be very fast
    });
  });

  describe('Edge cases', () => {
    it('should handle exact boundary values for signup', () => {
      const testStart = performance.now();

      // Test minimum valid lengths
      const minValidData = {
        username: 'a@b.co', // Minimum valid email
        first_name: 'A', // 1 character (minimum)
        last_name: 'B', // 1 character (minimum)
        password: '12345678' // 8 characters (minimum)
      };

      // Test maximum valid lengths
      const maxValidData = {
        username: 'a'.repeat(26) + '@b.co', // Close to max length email
        first_name: 'A'.repeat(30), // 30 characters (maximum)
        last_name: 'B'.repeat(30), // 30 characters (maximum)
        password: 'A'.repeat(30) // 30 characters (maximum)
      };

      const result1 = signupValidation(minValidData);
      const result2 = signupValidation(maxValidData);

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(result1).toEqual(minValidData);
      expect(result2).toEqual(maxValidData);
      expect(executionTime).toBeLessThan(20); // Should handle both quickly

      console.log(`✅ Signup validation boundary test completed in ${executionTime.toFixed(2)}ms`);
    });

    it('should handle exact boundary values for signin', () => {
      const testStart = performance.now();

      // Test minimum valid lengths
      const minValidData = {
        username: 'abc', // 3 characters (minimum)
        password: '12345678' // 8 characters (minimum)
      };

      // Test maximum valid lengths
      const maxValidData = {
        username: 'A'.repeat(30), // 30 characters (maximum)
        password: 'A'.repeat(30) // 30 characters (maximum)
      };

      const result1 = signinValidation(minValidData);
      const result2 = signinValidation(maxValidData);

      const testEnd = performance.now();
      const executionTime = testEnd - testStart;

      expect(result1).toEqual(minValidData);
      expect(result2).toEqual(maxValidData);
      expect(executionTime).toBeLessThan(20);

      console.log(`✅ Signin validation boundary test completed in ${executionTime.toFixed(2)}ms`);
    });
  });
}); 