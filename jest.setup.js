// jest.setup.js
import { jest } from '@jest/globals'

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key'
process.env.YOUTUBE_APIKEY = 'test-youtube-api-key'
process.env.PINECONE_API_KEY = 'test-pinecone-api-key'
process.env.PINECONE_INDEX_NAME = 'test-videosage-index'
process.env.GOOGLE_GEMINI_API_KEY = 'test-gemini-api-key'

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  space: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  content: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  youtubeContent: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  userContent: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  metadata: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  spaceContent: {
    create: jest.fn(),
    delete: jest.fn(),
  },
}

jest.mock('@/lib/prisma', () => mockPrisma)

// Mock external APIs
jest.mock('axios')
jest.mock('@/lib/utils', () => ({
  fetchTranscript2: jest.fn(),
  generateEmbeddings: jest.fn(),
  initializePinecone: jest.fn(),
  preprocessTranscript: jest.fn(),
  upsertChunksToPinecone: jest.fn(),
  summarizeChunks: jest.fn(),
  generateMindMap: jest.fn(),
  generateQuiz: jest.fn(),
  generateFlashcards: jest.fn(),
}))

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(() => ({ user_id: 'test-user-id', username: 'testuser' })),
}))

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
  compare: jest.fn(() => Promise.resolve(true)),
}))

// Performance monitoring setup
global.performance = require('perf_hooks').performance
global.startTime = Date.now()

beforeEach(() => {
  global.testStartTime = performance.now()
})

afterEach(() => {
  const testEndTime = performance.now()
  const testDuration = testEndTime - global.testStartTime
  console.log(`Test execution time: ${testDuration.toFixed(2)}ms`)
}) 