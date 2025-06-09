#!/bin/bash

# VideoSage Test Runner Script
# Runs all test suites and generates comprehensive performance reports

echo "🚀 Starting VideoSage Test Suite with Performance Monitoring"
echo "============================================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create test reports directory
mkdir -p test-reports

echo -e "${BLUE}📊 Running Test Results Generator...${NC}"
node __tests__/test-results-generator.js

echo -e "\n${BLUE}🧪 Running Unit and Integration Tests...${NC}"

# Run validation tests first (fastest)
echo -e "\n${YELLOW}1. Running Validation Tests${NC}"
npm run test:validations -- --verbose

# Run API tests
echo -e "\n${YELLOW}2. Running API Tests${NC}"
npm run test:api -- --verbose

# Run E2E tests
echo -e "\n${YELLOW}3. Running End-to-End Tests${NC}"
npm test __tests__/e2e -- --verbose

# Run all tests with coverage
echo -e "\n${YELLOW}4. Running Complete Test Suite with Coverage${NC}"
npm run test:coverage

echo -e "\n${GREEN}✅ Test Suite Completed!${NC}"
echo -e "\n${BLUE}📈 Performance Summary:${NC}"
echo "- Test Results: ./test-reports/test-results.html"
echo "- Coverage Report: ./coverage/lcov-report/index.html"
echo "- JSON Results: ./test-reports/test-results.json"

echo -e "\n${BLUE}🔍 Test Categories Covered:${NC}"
echo "- Authentication & Authorization"
echo "- Input Validation & Error Handling"
echo "- Database Operations"
echo "- External API Integration"
echo "- AI Content Generation"
echo "- Performance Benchmarks"
echo "- End-to-End User Flows"

echo -e "\n${BLUE}🎯 Performance Targets:${NC}"
echo "- Authentication: < 1000ms"
echo "- Validation: < 10ms"
echo "- Data Retrieval: < 1000ms"
echo "- Content Processing: < 5000ms"
echo "- AI Generation: < 3000ms"

echo -e "\n${BLUE}🔑 Test Credentials:${NC}"
echo "- Email: lokeshkhabiya0022@gmail.com"
echo "- Password: Igris123"

echo -e "\n${GREEN}🎉 VideoSage Test Suite Complete! Check the reports above for detailed results.${NC}" 