#!/bin/bash

# CigarAtlas Authentication Test Script
# Tests the JWT authentication and Apple Sign In flow

BASE_URL="http://localhost:8787"

echo "=========================================="
echo "CigarAtlas Authentication Test Suite"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to print test results
print_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $2"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗${NC} $2"
    ((TESTS_FAILED++))
  fi
}

# Test 1: Health Check
echo "Test 1: Health Check"
echo "--------------------"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/health")
if [ "$RESPONSE" == "200" ]; then
  print_result 0 "Health check passed (HTTP $RESPONSE)"
else
  print_result 1 "Health check failed (HTTP $RESPONSE)"
fi
echo ""

# Test 2: Apple Sign In (Development Mode)
echo "Test 2: Apple Sign In (Development Mode)"
echo "-----------------------------------------"
RESPONSE=$(curl -s -X POST "${BASE_URL}/v1/auth/apple" \
  -H "Content-Type: application/json" \
  -d '{"identityToken": "test-token"}')

echo "$RESPONSE" | jq .

# Check if we got tokens
ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.data.accessToken // empty')
REFRESH_TOKEN=$(echo "$RESPONSE" | jq -r '.data.refreshToken // empty')
USER_ID=$(echo "$RESPONSE" | jq -r '.data.user.id // empty')

if [ -n "$ACCESS_TOKEN" ] && [ -n "$REFRESH_TOKEN" ]; then
  print_result 0 "Apple Sign In successful"
  echo "  Access Token: ${ACCESS_TOKEN:0:50}..."
  echo "  Refresh Token: ${REFRESH_TOKEN:0:50}..."
  echo "  User ID: $USER_ID"
else
  print_result 1 "Apple Sign In failed"
fi
echo ""

# Test 3: Get Current User (with valid token)
echo "Test 3: Get Current User (Authenticated)"
echo "-----------------------------------------"
if [ -n "$ACCESS_TOKEN" ]; then
  RESPONSE=$(curl -s "${BASE_URL}/v1/auth/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  echo "$RESPONSE" | jq .
  
  SUCCESS=$(echo "$RESPONSE" | jq -r '.success // false')
  if [ "$SUCCESS" == "true" ]; then
    print_result 0 "Get current user successful"
  else
    print_result 1 "Get current user failed"
  fi
else
  print_result 1 "Skipped (no access token)"
  ((TESTS_FAILED++))
fi
echo ""

# Test 4: Access Protected Route (without token)
echo "Test 4: Access Protected Route (No Token)"
echo "------------------------------------------"
RESPONSE=$(curl -s "${BASE_URL}/v1/humidors")
echo "$RESPONSE" | jq .

ERROR_CODE=$(echo "$RESPONSE" | jq -r '.error.code // empty')
if [ "$ERROR_CODE" == "UNAUTHORIZED" ]; then
  print_result 0 "Protected route correctly rejected unauthenticated request"
else
  print_result 1 "Protected route should reject unauthenticated request"
fi
echo ""

# Test 5: Access Protected Route (with valid token)
echo "Test 5: Access Protected Route (With Token)"
echo "--------------------------------------------"
if [ -n "$ACCESS_TOKEN" ]; then
  RESPONSE=$(curl -s "${BASE_URL}/v1/humidors" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  echo "$RESPONSE" | jq .
  
  SUCCESS=$(echo "$RESPONSE" | jq -r '.success // false')
  if [ "$SUCCESS" == "true" ]; then
    print_result 0 "Protected route accessible with valid token"
  else
    print_result 1 "Protected route should be accessible with valid token"
  fi
else
  print_result 1 "Skipped (no access token)"
  ((TESTS_FAILED++))
fi
echo ""

# Test 6: Token Refresh
echo "Test 6: Token Refresh"
echo "---------------------"
if [ -n "$REFRESH_TOKEN" ]; then
  RESPONSE=$(curl -s -X POST "${BASE_URL}/v1/auth/refresh" \
    -H "Content-Type: application/json" \
    -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")
  
  echo "$RESPONSE" | jq .
  
  NEW_ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.data.accessToken // empty')
  NEW_REFRESH_TOKEN=$(echo "$RESPONSE" | jq -r '.data.refreshToken // empty')
  
  if [ -n "$NEW_ACCESS_TOKEN" ] && [ -n "$NEW_REFRESH_TOKEN" ]; then
    print_result 0 "Token refresh successful"
    ACCESS_TOKEN=$NEW_ACCESS_TOKEN
    REFRESH_TOKEN=$NEW_REFRESH_TOKEN
  else
    print_result 1 "Token refresh failed"
  fi
else
  print_result 1 "Skipped (no refresh token)"
  ((TESTS_FAILED++))
fi
echo ""

# Test 7: Logout
echo "Test 7: Logout"
echo "--------------"
if [ -n "$ACCESS_TOKEN" ]; then
  RESPONSE=$(curl -s -X POST "${BASE_URL}/v1/auth/logout" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  echo "$RESPONSE" | jq .
  
  SUCCESS=$(echo "$RESPONSE" | jq -r '.success // false')
  if [ "$SUCCESS" == "true" ]; then
    print_result 0 "Logout successful"
  else
    print_result 1 "Logout failed"
  fi
else
  print_result 1 "Skipped (no access token)"
  ((TESTS_FAILED++))
fi
echo ""

# Test 8: Invalid Token
echo "Test 8: Invalid Token Handling"
echo "-------------------------------"
RESPONSE=$(curl -s "${BASE_URL}/v1/auth/me" \
  -H "Authorization: Bearer invalid-token-12345")

echo "$RESPONSE" | jq .

ERROR_CODE=$(echo "$RESPONSE" | jq -r '.error.code // empty')
if [ "$ERROR_CODE" == "UNAUTHORIZED" ]; then
  print_result 0 "Invalid token correctly rejected"
else
  print_result 1 "Invalid token should be rejected"
fi
echo ""

# Summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed.${NC}"
  exit 1
fi
