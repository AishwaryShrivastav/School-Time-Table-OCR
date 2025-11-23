#!/bin/bash

echo "🧪 Running Timetable OCR Tests..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Test 1: Health Check
echo "Test 1: Health Check"
response=$(curl -s http://localhost:5000/health)
if echo "$response" | grep -q "ok"; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi
echo ""

# Test 2: Basic Upload
echo "Test 2: Basic Timetable Extraction"
response=$(curl -s -X POST http://localhost:5000/api/timetable/extract \
  -F "file=@samples/sample-timetable-basic.txt")
if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✅ PASS${NC}"
    # Show extracted title
    title=$(echo "$response" | grep -o '"title":"[^"]*"' | head -1)
    echo "   $title"
else
    echo -e "${RED}❌ FAIL${NC}"
fi
echo ""

# Test 3: Detailed Upload
echo "Test 3: Detailed Timetable Extraction"
response=$(curl -s -X POST http://localhost:5000/api/timetable/extract \
  -F "file=@samples/sample-timetable-detailed.txt")
if echo "$response" | grep -q "days"; then
    echo -e "${GREEN}✅ PASS${NC}"
    # Count days extracted
    days=$(echo "$response" | grep -o '"day"' | wc -l)
    echo "   Extracted $days days"
else
    echo -e "${RED}❌ FAIL${NC}"
fi
echo ""

# Test 4: Error Handling - Missing File
echo "Test 4: Error Handling (Missing File)"
response=$(curl -s -X POST http://localhost:5000/api/timetable/extract)
if echo "$response" | grep -q "error"; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi
echo ""

echo "🏁 Tests Complete"

