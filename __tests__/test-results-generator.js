#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Test Results Generator for VideoSage Application
 * This script generates a comprehensive table of all test cases with results and performance metrics
 */

const testResults = {
  summary: {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    totalExecutionTime: 0,
    avgExecutionTime: 0,
    testSuites: 0,
  },
  testCases: []
};

// Define all test cases organized by route/functionality
const testCaseDefinitions = [
  // Authentication Routes
  {
    route: '/api/users/signin',
    testCase: 'should successfully sign in user with valid credentials',
    description: 'Tests user authentication with correct email and password',
    expectedResult: '200 OK with user data and JWT token',
    performanceTarget: '< 1000ms',
    category: 'Authentication',
    priority: 'High',
    dependencies: ['Database', 'JWT', 'bcrypt']
  },
  {
    route: '/api/users/signin',
    testCase: 'should return 401 for non-existent user',
    description: 'Tests authentication failure for invalid username',
    expectedResult: '401 Unauthorized with error message',
    performanceTarget: '< 500ms',
    category: 'Authentication',
    priority: 'High',
    dependencies: ['Database']
  },
  {
    route: '/api/users/signin',
    testCase: 'should return 401 for incorrect password',
    description: 'Tests authentication failure for wrong password',
    expectedResult: '401 Unauthorized with error message',
    performanceTarget: '< 500ms',
    category: 'Authentication',
    priority: 'High',
    dependencies: ['Database', 'bcrypt']
  },
  {
    route: '/api/users/signin',
    testCase: 'should return 400 for invalid input format',
    description: 'Tests input validation for malformed data',
    expectedResult: '400 Bad Request with validation errors',
    performanceTarget: '< 100ms',
    category: 'Validation',
    priority: 'Medium',
    dependencies: ['Zod validation']
  },
  {
    route: '/api/users/signin',
    testCase: 'should handle database errors gracefully',
    description: 'Tests error handling for database connectivity issues',
    expectedResult: '500 Internal Server Error with generic message',
    performanceTarget: '< 1000ms',
    category: 'Error Handling',
    priority: 'Medium',
    dependencies: ['Database']
  },
  {
    route: '/api/users/signin',
    testCase: 'should meet performance requirements for high load',
    description: 'Performance benchmark test for multiple concurrent requests',
    expectedResult: 'Average < 100ms, Max < 500ms for 10 iterations',
    performanceTarget: 'Avg < 100ms',
    category: 'Performance',
    priority: 'High',
    dependencies: ['Database', 'JWT', 'bcrypt']
  },

  // User Registration
  {
    route: '/api/users/signup',
    testCase: 'should successfully create new user with valid data',
    description: 'Tests user registration with valid signup data',
    expectedResult: '200 OK with new user data',
    performanceTarget: '< 2000ms',
    category: 'Authentication',
    priority: 'High',
    dependencies: ['Database', 'bcrypt']
  },
  {
    route: '/api/users/signup',
    testCase: 'should return 400 for invalid email format',
    description: 'Tests email validation during registration',
    expectedResult: '400 Bad Request with validation error',
    performanceTarget: '< 100ms',
    category: 'Validation',
    priority: 'Medium',
    dependencies: ['Zod validation']
  },
  {
    route: '/api/users/signup',
    testCase: 'should return 400 for short password',
    description: 'Tests password length validation',
    expectedResult: '400 Bad Request with validation error',
    performanceTarget: '< 100ms',
    category: 'Validation',
    priority: 'Medium',
    dependencies: ['Zod validation']
  },
  {
    route: '/api/users/signup',
    testCase: 'should return 400 for missing required fields',
    description: 'Tests required field validation',
    expectedResult: '400 Bad Request with validation error',
    performanceTarget: '< 100ms',
    category: 'Validation',
    priority: 'Medium',
    dependencies: ['Zod validation']
  },
  {
    route: '/api/users/signup',
    testCase: 'should meet performance requirements for signup operations',
    description: 'Performance benchmark for user registration',
    expectedResult: 'Average < 200ms, Max < 1000ms for 5 iterations',
    performanceTarget: 'Avg < 200ms',
    category: 'Performance',
    priority: 'Medium',
    dependencies: ['Database', 'bcrypt']
  },

  // Spaces Management
  {
    route: '/api/spaces GET',
    testCase: 'should return 401 for missing authorization header',
    description: 'Tests authentication requirement for fetching spaces',
    expectedResult: '401 Unauthorized',
    performanceTarget: '< 50ms',
    category: 'Authorization',
    priority: 'High',
    dependencies: ['JWT middleware']
  },
  {
    route: '/api/spaces GET',
    testCase: 'should return 401 for invalid token',
    description: 'Tests JWT token validation',
    expectedResult: '401 Unauthorized',
    performanceTarget: '< 100ms',
    category: 'Authorization',
    priority: 'High',
    dependencies: ['JWT verification']
  },
  {
    route: '/api/spaces GET',
    testCase: 'should successfully fetch user spaces with valid token',
    description: 'Tests retrieval of user-specific spaces',
    expectedResult: '200 OK with user spaces data',
    performanceTarget: '< 1000ms',
    category: 'Data Retrieval',
    priority: 'High',
    dependencies: ['Database', 'JWT']
  },
  {
    route: '/api/spaces POST',
    testCase: 'should return 401 for missing authorization header',
    description: 'Tests authentication requirement for creating spaces',
    expectedResult: '401 Unauthorized',
    performanceTarget: '< 50ms',
    category: 'Authorization',
    priority: 'High',
    dependencies: ['JWT middleware']
  },
  {
    route: '/api/spaces POST',
    testCase: 'should return 400 for empty space name',
    description: 'Tests space name validation',
    expectedResult: '400 Bad Request with validation error',
    performanceTarget: '< 100ms',
    category: 'Validation',
    priority: 'Medium',
    dependencies: ['Input validation']
  },
  {
    route: '/api/spaces POST',
    testCase: 'should successfully create space with valid data',
    description: 'Tests space creation with valid data',
    expectedResult: '201 Created with new space data',
    performanceTarget: '< 1000ms',
    category: 'Data Creation',
    priority: 'High',
    dependencies: ['Database', 'JWT']
  },
  {
    route: '/api/spaces',
    testCase: 'should meet performance requirements for space operations',
    description: 'Performance benchmark for space CRUD operations',
    expectedResult: 'GET avg < 300ms, POST avg < 500ms',
    performanceTarget: 'As specified',
    category: 'Performance',
    priority: 'Medium',
    dependencies: ['Database', 'JWT']
  },

  // Content Processing
  {
    route: '/api/contents POST',
    testCase: 'should return 401 for missing authorization header',
    description: 'Tests authentication requirement for content processing',
    expectedResult: '401 Unauthorized',
    performanceTarget: '< 50ms',
    category: 'Authorization',
    priority: 'High',
    dependencies: ['JWT middleware']
  },
  {
    route: '/api/contents POST',
    testCase: 'should return 400 for missing youtube_url',
    description: 'Tests required parameter validation',
    expectedResult: '400 Bad Request with error message',
    performanceTarget: '< 100ms',
    category: 'Validation',
    priority: 'Medium',
    dependencies: ['Input validation']
  },
  {
    route: '/api/contents POST',
    testCase: 'should return 400 for invalid YouTube URL',
    description: 'Tests YouTube URL format validation',
    expectedResult: '400 Bad Request with error message',
    performanceTarget: '< 100ms',
    category: 'Validation',
    priority: 'Medium',
    dependencies: ['URL validation']
  },
  {
    route: '/api/contents POST',
    testCase: 'should successfully process valid YouTube content',
    description: 'Tests complete YouTube video processing workflow',
    expectedResult: '200 OK with processed content data',
    performanceTarget: '< 5000ms',
    category: 'Content Processing',
    priority: 'High',
    dependencies: ['YouTube API', 'Database', 'Transcript processing', 'Embeddings']
  },
  {
    route: '/api/contents POST',
    testCase: 'should handle existing content reuse efficiently',
    description: 'Tests content deduplication and reuse',
    expectedResult: '200 OK with reused content data',
    performanceTarget: '< 1000ms',
    category: 'Optimization',
    priority: 'Medium',
    dependencies: ['Database']
  },
  {
    route: '/api/contents GET',
    testCase: 'should return user contents successfully',
    description: 'Tests fetching user-specific content',
    expectedResult: '200 OK with user content list',
    performanceTarget: '< 1000ms',
    category: 'Data Retrieval',
    priority: 'High',
    dependencies: ['Database', 'JWT']
  },
  {
    route: '/api/contents',
    testCase: 'should meet performance requirements for content processing',
    description: 'Performance benchmark for content operations',
    expectedResult: 'Average < 2000ms, Max < 5000ms',
    performanceTarget: 'As specified',
    category: 'Performance',
    priority: 'High',
    dependencies: ['Multiple services']
  },
  {
    route: '/api/contents POST',
    testCase: 'should handle transcript fetch failures gracefully',
    description: 'Tests error handling for transcript extraction failures',
    expectedResult: '400 Bad Request with error message',
    performanceTarget: '< 1000ms',
    category: 'Error Handling',
    priority: 'Medium',
    dependencies: ['YouTube transcript service']
  },
  {
    route: '/api/contents POST',
    testCase: 'should handle YouTube API failures gracefully',
    description: 'Tests error handling for YouTube API failures',
    expectedResult: '404 Not Found with error message',
    performanceTarget: '< 2000ms',
    category: 'Error Handling',
    priority: 'Medium',
    dependencies: ['YouTube API']
  },

  // AI Generation - Summary
  {
    route: '/api/generate/summary GET',
    testCase: 'should return 403 for missing video_id parameter',
    description: 'Tests parameter validation for summary generation',
    expectedResult: '403 Forbidden with error message',
    performanceTarget: '< 50ms',
    category: 'Validation',
    priority: 'Medium',
    dependencies: ['Parameter validation']
  },
  {
    route: '/api/generate/summary GET',
    testCase: 'should return 403 for missing content_id parameter',
    description: 'Tests parameter validation for summary generation',
    expectedResult: '403 Forbidden with error message',
    performanceTarget: '< 50ms',
    category: 'Validation',
    priority: 'Medium',
    dependencies: ['Parameter validation']
  },
  {
    route: '/api/generate/summary GET',
    testCase: 'should return 401 for unauthorized user',
    description: 'Tests user authorization for content access',
    expectedResult: '401 Unauthorized with error message',
    performanceTarget: '< 100ms',
    category: 'Authorization',
    priority: 'High',
    dependencies: ['Database', 'User-content relationship']
  },
  {
    route: '/api/generate/summary GET',
    testCase: 'should return existing summary quickly when available',
    description: 'Tests cached summary retrieval',
    expectedResult: '200 OK with existing summary',
    performanceTarget: '< 200ms',
    category: 'Caching',
    priority: 'High',
    dependencies: ['Database']
  },
  {
    route: '/api/generate/summary GET',
    testCase: 'should generate new summary when none exists',
    description: 'Tests AI-powered summary generation',
    expectedResult: '200 OK with generated summary',
    performanceTarget: '< 3000ms',
    category: 'AI Generation',
    priority: 'High',
    dependencies: ['Database', 'AI service', 'Transcript data']
  },
  {
    route: '/api/generate/summary GET',
    testCase: 'should return 404 when no transcript is found',
    description: 'Tests error handling for missing transcript data',
    expectedResult: '404 Not Found with error message',
    performanceTarget: '< 500ms',
    category: 'Error Handling',
    priority: 'Medium',
    dependencies: ['Database']
  },
  {
    route: '/api/generate/summary GET',
    testCase: 'should handle AI generation failures gracefully',
    description: 'Tests error handling for AI service failures',
    expectedResult: '500 Internal Server Error with error message',
    performanceTarget: '< 2000ms',
    category: 'Error Handling',
    priority: 'Medium',
    dependencies: ['AI service']
  },
  {
    route: '/api/generate/summary',
    testCase: 'should meet performance requirements for summary operations',
    description: 'Performance benchmark for summary generation',
    expectedResult: 'Existing < 100ms, New < 3000ms',
    performanceTarget: 'As specified',
    category: 'Performance',
    priority: 'High',
    dependencies: ['Database', 'AI service']
  },
  {
    route: '/api/generate/summary GET',
    testCase: 'should handle database errors gracefully',
    description: 'Tests error handling for database connectivity issues',
    expectedResult: '500 Internal Server Error with error message',
    performanceTarget: '< 1000ms',
    category: 'Error Handling',
    priority: 'Medium',
    dependencies: ['Database']
  },

  // Validation Tests
  {
    route: 'Validation/signupValidation',
    testCase: 'should validate correct signup data',
    description: 'Tests validation of valid signup form data',
    expectedResult: 'Valid data object returned',
    performanceTarget: '< 10ms',
    category: 'Validation',
    priority: 'High',
    dependencies: ['Zod schema validation']
  },
  {
    route: 'Validation/signupValidation',
    testCase: 'should reject invalid email format',
    description: 'Tests email format validation',
    expectedResult: 'Validation error thrown',
    performanceTarget: '< 10ms',
    category: 'Validation',
    priority: 'High',
    dependencies: ['Zod schema validation']
  },
  {
    route: 'Validation/signupValidation',
    testCase: 'should reject short first name',
    description: 'Tests minimum length validation for first name',
    expectedResult: 'Validation error thrown',
    performanceTarget: '< 10ms',
    category: 'Validation',
    priority: 'Medium',
    dependencies: ['Zod schema validation']
  },
  {
    route: 'Validation/signupValidation',
    testCase: 'should reject long first name',
    description: 'Tests maximum length validation for first name',
    expectedResult: 'Validation error thrown',
    performanceTarget: '< 10ms',
    category: 'Validation',
    priority: 'Medium',
    dependencies: ['Zod schema validation']
  },
  {
    route: 'Validation/signupValidation',
    testCase: 'should reject short password',
    description: 'Tests minimum password length validation',
    expectedResult: 'Validation error thrown',
    performanceTarget: '< 10ms',
    category: 'Validation',
    priority: 'High',
    dependencies: ['Zod schema validation']
  },
  {
    route: 'Validation/signupValidation',
    testCase: 'should reject long password',
    description: 'Tests maximum password length validation',
    expectedResult: 'Validation error thrown',
    performanceTarget: '< 10ms',
    category: 'Validation',
    priority: 'Medium',
    dependencies: ['Zod schema validation']
  },
  {
    route: 'Validation/signupValidation',
    testCase: 'should reject missing fields',
    description: 'Tests required field validation',
    expectedResult: 'Validation error thrown',
    performanceTarget: '< 10ms',
    category: 'Validation',
    priority: 'High',
    dependencies: ['Zod schema validation']
  },
  {
    route: 'Validation/signinValidation',
    testCase: 'should validate correct signin data',
    description: 'Tests validation of valid signin form data',
    expectedResult: 'Valid data object returned',
    performanceTarget: '< 10ms',
    category: 'Validation',
    priority: 'High',
    dependencies: ['Zod schema validation']
  },
  {
    route: 'Validation/signinValidation',
    testCase: 'should validate signin with just username (not email)',
    description: 'Tests username format validation',
    expectedResult: 'Valid data object returned',
    performanceTarget: '< 10ms',
    category: 'Validation',
    priority: 'Medium',
    dependencies: ['Zod schema validation']
  },
  {
    route: 'Validation/signinValidation',
    testCase: 'should reject short username',
    description: 'Tests minimum username length validation',
    expectedResult: 'Validation error thrown',
    performanceTarget: '< 10ms',
    category: 'Validation',
    priority: 'Medium',
    dependencies: ['Zod schema validation']
  },
  {
    route: 'Validation/signinValidation',
    testCase: 'should reject long username',
    description: 'Tests maximum username length validation',
    expectedResult: 'Validation error thrown',
    performanceTarget: '< 10ms',
    category: 'Validation',
    priority: 'Medium',
    dependencies: ['Zod schema validation']
  },
  {
    route: 'Validation/signinValidation',
    testCase: 'should reject short password',
    description: 'Tests minimum password length validation',
    expectedResult: 'Validation error thrown',
    performanceTarget: '< 10ms',
    category: 'Validation',
    priority: 'High',
    dependencies: ['Zod schema validation']
  },
  {
    route: 'Validation/signinValidation',
    testCase: 'should reject missing fields',
    description: 'Tests required field validation',
    expectedResult: 'Validation error thrown',
    performanceTarget: '< 10ms',
    category: 'Validation',
    priority: 'High',
    dependencies: ['Zod schema validation']
  },
  {
    route: 'Validation',
    testCase: 'should meet performance requirements for validation operations',
    description: 'Performance benchmark for validation functions',
    expectedResult: 'Average < 1ms for both signup and signin',
    performanceTarget: 'Avg < 1ms',
    category: 'Performance',
    priority: 'Medium',
    dependencies: ['Zod schema validation']
  },
  {
    route: 'Validation',
    testCase: 'should handle validation errors efficiently',
    description: 'Performance test for error handling in validation',
    expectedResult: 'Error handling < 2ms average',
    performanceTarget: 'Avg < 2ms',
    category: 'Performance',
    priority: 'Low',
    dependencies: ['Zod schema validation']
  },
  {
    route: 'Validation/signupValidation',
    testCase: 'should handle exact boundary values for signup',
    description: 'Tests edge cases with minimum and maximum valid values',
    expectedResult: 'Both minimum and maximum valid values accepted',
    performanceTarget: '< 20ms',
    category: 'Edge Cases',
    priority: 'Medium',
    dependencies: ['Zod schema validation']
  },
  {
    route: 'Validation/signinValidation',
    testCase: 'should handle exact boundary values for signin',
    description: 'Tests edge cases with minimum and maximum valid values',
    expectedResult: 'Both minimum and maximum valid values accepted',
    performanceTarget: '< 20ms',
    category: 'Edge Cases',
    priority: 'Medium',
    dependencies: ['Zod schema validation']
  }
];

// Add test case definitions to results
testCaseDefinitions.forEach((testCase, index) => {
  testResults.testCases.push({
    id: index + 1,
    ...testCase,
    status: 'Not Run', // Will be updated when tests are actually executed
    actualExecutionTime: 'N/A',
    actualResult: 'Pending',
    issues: [],
    lastRun: 'Never'
  });
});

// Update summary
testResults.summary.totalTests = testCaseDefinitions.length;
testResults.summary.testSuites = [...new Set(testCaseDefinitions.map(tc => tc.route))].length;

function generateHTMLReport() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VideoSage Test Results Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 30px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
        }
        .header h1 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .header p {
            color: #7f8c8d;
            font-size: 16px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .summary-card p {
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .filters {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .filter-btn {
            padding: 8px 16px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .filter-btn:hover, .filter-btn.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
        .test-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .test-table th,
        .test-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
        }
        .test-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #2c3e50;
            position: sticky;
            top: 0;
        }
        .test-table tr:hover {
            background-color: #f8f9fa;
        }
        .status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        .status.passed { background: #d4edda; color: #155724; }
        .status.failed { background: #f8d7da; color: #721c24; }
        .status.pending { background: #fff3cd; color: #856404; }
        .status.not-run { background: #e2e3e5; color: #495057; }
        .priority {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
        }
        .priority.high { background: #f8d7da; color: #721c24; }
        .priority.medium { background: #fff3cd; color: #856404; }
        .priority.low { background: #d1ecf1; color: #0c5460; }
        .category {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            white-space: nowrap;
        }
        .category.authentication { background: #e7f3ff; color: #0066cc; }
        .category.validation { background: #fff2e7; color: #cc6600; }
        .category.authorization { background: #ffe7e7; color: #cc0000; }
        .category.performance { background: #e7ffe7; color: #00cc00; }
        .category.error-handling { background: #f0e7ff; color: #6600cc; }
        .category.data-retrieval { background: #e7fff0; color: #009900; }
        .category.data-creation { background: #ffe7f0; color: #cc0066; }
        .category.content-processing { background: #f0ffe7; color: #66cc00; }
        .category.ai-generation { background: #e7f0ff; color: #0099cc; }
        .category.optimization { background: #fff0e7; color: #cc9900; }
        .category.caching { background: #ffe7ff; color: #cc00cc; }
        .category.edge-cases { background: #f5f5f5; color: #666666; }
        .route-section {
            margin-bottom: 30px;
        }
        .route-header {
            background: #667eea;
            color: white;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 10px;
        }
        .route-header h3 {
            margin: 0;
            font-size: 18px;
        }
        .legend {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .performance-metric {
            font-family: monospace;
            font-size: 12px;
            padding: 2px 4px;
            background: #f8f9fa;
            border-radius: 3px;
        }
        @media (max-width: 768px) {
            .test-table {
                font-size: 12px;
            }
            .test-table th,
            .test-table td {
                padding: 8px 4px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 VideoSage Test Results Report</h1>
            <p>Comprehensive testing results for all application routes with performance metrics</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Login Credentials:</strong> lokeshkhabiya0022@gmail.com / Igris123</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <h3>${testResults.summary.totalTests}</h3>
                <p>Total Test Cases</p>
            </div>
            <div class="summary-card">
                <h3>${testResults.summary.testSuites}</h3>
                <p>Test Suites</p>
            </div>
            <div class="summary-card">
                <h3>${testResults.summary.passedTests}</h3>
                <p>Passed Tests</p>
            </div>
            <div class="summary-card">
                <h3>${testResults.summary.failedTests}</h3>
                <p>Failed Tests</p>
            </div>
        </div>

        <div class="legend">
            <div class="legend-item">
                <span class="status passed">Passed</span>
                <span>Test completed successfully</span>
            </div>
            <div class="legend-item">
                <span class="status failed">Failed</span>
                <span>Test failed or threw error</span>
            </div>
            <div class="legend-item">
                <span class="status pending">Pending</span>
                <span>Test scheduled to run</span>
            </div>
            <div class="legend-item">
                <span class="status not-run">Not Run</span>
                <span>Test not executed yet</span>
            </div>
        </div>

        <div class="filters">
            <button class="filter-btn active" onclick="filterTests('all')">All Tests</button>
            <button class="filter-btn" onclick="filterTests('Authentication')">Authentication</button>
            <button class="filter-btn" onclick="filterTests('Validation')">Validation</button>
            <button class="filter-btn" onclick="filterTests('Performance')">Performance</button>
            <button class="filter-btn" onclick="filterTests('Error Handling')">Error Handling</button>
            <button class="filter-btn" onclick="filterTests('High')">High Priority</button>
        </div>

        <table class="test-table" id="testTable">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Route/Component</th>
                    <th>Test Case</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Expected Result</th>
                    <th>Performance Target</th>
                    <th>Status</th>
                    <th>Actual Time</th>
                    <th>Dependencies</th>
                </tr>
            </thead>
            <tbody>
                ${testResults.testCases.map(testCase => `
                    <tr data-category="${testCase.category}" data-priority="${testCase.priority}">
                        <td>${testCase.id}</td>
                        <td><strong>${testCase.route}</strong></td>
                        <td>${testCase.testCase}</td>
                        <td><span class="category ${testCase.category.toLowerCase().replace(/\s+/g, '-')}">${testCase.category}</span></td>
                        <td><span class="priority ${testCase.priority.toLowerCase()}">${testCase.priority}</span></td>
                        <td>${testCase.expectedResult}</td>
                        <td><span class="performance-metric">${testCase.performanceTarget}</span></td>
                        <td><span class="status ${testCase.status.toLowerCase().replace(/\s+/g, '-')}">${testCase.status}</span></td>
                        <td><span class="performance-metric">${testCase.actualExecutionTime}</span></td>
                        <td style="font-size: 11px;">${testCase.dependencies.join(', ')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <script>
        function filterTests(category) {
            const rows = document.querySelectorAll('#testTable tbody tr');
            const buttons = document.querySelectorAll('.filter-btn');
            
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            rows.forEach(row => {
                if (category === 'all') {
                    row.style.display = '';
                } else {
                    const rowCategory = row.dataset.category;
                    const rowPriority = row.dataset.priority;
                    if (rowCategory === category || rowPriority === category) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
        }
    </script>
</body>
</html>
  `;

  return html;
}

function generateMarkdownReport() {
  const markdown = `# VideoSage Test Results Report

**Generated:** ${new Date().toLocaleString()}  
**Login Credentials:** lokeshkhabiya0022@gmail.com / Igris123

## Summary

| Metric | Value |
|--------|-------|
| Total Test Cases | ${testResults.summary.totalTests} |
| Test Suites | ${testResults.summary.testSuites} |
| Passed Tests | ${testResults.summary.passedTests} |
| Failed Tests | ${testResults.summary.failedTests} |
| Pending Tests | ${testResults.summary.totalTests - testResults.summary.passedTests - testResults.summary.failedTests} |

## Test Cases

| ID | Route/Component | Test Case | Category | Priority | Expected Result | Performance Target | Status |
|----|-----------------|-----------|----------|----------|-----------------|-------------------|--------|
${testResults.testCases.map(tc => 
  `| ${tc.id} | ${tc.route} | ${tc.testCase} | ${tc.category} | ${tc.priority} | ${tc.expectedResult} | ${tc.performanceTarget} | ${tc.status} |`
).join('\n')}

## Test Categories

### Authentication Tests
- User signin/signup functionality
- JWT token handling
- Password validation and hashing

### Validation Tests  
- Input data validation
- Schema validation with Zod
- Boundary value testing

### Performance Tests
- Response time benchmarks
- Load testing scenarios
- Memory and CPU usage monitoring

### Error Handling Tests
- Database connectivity failures
- External API failures
- Graceful error responses

### Authorization Tests
- JWT token verification
- User permission validation
- Resource access control

## Performance Targets

- **Authentication Operations:** < 1000ms average
- **Validation Operations:** < 10ms average  
- **Data Retrieval:** < 1000ms average
- **Content Processing:** < 5000ms average
- **AI Generation:** < 3000ms average
- **Error Responses:** < 500ms average

## Dependencies

- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT tokens, bcrypt hashing
- **Validation:** Zod schema validation
- **External APIs:** YouTube Data API v3
- **AI Services:** Google Gemini API
- **Vector Database:** Pinecone
- **Content Processing:** YouTube transcript extraction

## Notes

This comprehensive test suite covers all major application routes and functionality with performance monitoring. Each test includes specific performance targets and dependency tracking for better debugging and optimization.

To run the tests:
\`\`\`bash
npm test                    # Run all tests
npm run test:api           # Run API tests only
npm run test:validations   # Run validation tests only
npm run test:performance   # Run with verbose performance output
npm run test:coverage      # Run with coverage report
\`\`\`
`;

  return markdown;
}

// Generate reports
function generateReports() {
  const htmlReport = generateHTMLReport();
  const markdownReport = generateMarkdownReport();

  // Ensure directories exist
  if (!fs.existsSync('./test-reports')) {
    fs.mkdirSync('./test-reports', { recursive: true });
  }

  // Write HTML report
  fs.writeFileSync('./test-reports/test-results.html', htmlReport);
  console.log('✅ HTML test report generated: ./test-reports/test-results.html');

  // Write Markdown report
  fs.writeFileSync('./test-reports/test-results.md', markdownReport);
  console.log('✅ Markdown test report generated: ./test-reports/test-results.md');

  // Write JSON data for programmatic access
  fs.writeFileSync('./test-reports/test-results.json', JSON.stringify(testResults, null, 2));
  console.log('✅ JSON test data generated: ./test-reports/test-results.json');

  console.log('\n📊 Test Report Summary:');
  console.log(`- Total Test Cases: ${testResults.summary.totalTests}`);
  console.log(`- Test Suites: ${testResults.summary.testSuites}`);
  console.log(`- Categories: ${[...new Set(testResults.testCases.map(tc => tc.category))].length}`);
  console.log(`- High Priority Tests: ${testResults.testCases.filter(tc => tc.priority === 'High').length}`);
  console.log(`- Performance Tests: ${testResults.testCases.filter(tc => tc.category === 'Performance').length}`);
}

// Run the generator
if (require.main === module) {
  generateReports();
}

module.exports = { generateReports, testResults }; 