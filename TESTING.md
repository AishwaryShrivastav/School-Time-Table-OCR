# 🧪 Testing Guide

Complete guide for testing the Timetable OCR Platform.

## Table of Contents
1. [Pre-Testing Checklist](#pre-testing-checklist)
2. [Frontend Testing](#frontend-testing)
3. [Backend API Testing](#backend-api-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [Performance Testing](#performance-testing)
6. [Troubleshooting](#troubleshooting)

---

## Pre-Testing Checklist

Before running tests, ensure:

- ✅ Both backend and frontend servers are running
- ✅ OpenAI API key is configured in `backend/.env`
- ✅ Sample files exist in `samples/` directory
- ✅ Browser console is open (F12) for debugging

### Quick Setup Verification

```bash
# Terminal 1: Start Backend
cd backend
npm run dev
# Should see: "🚀 Server is running on port 5000"

# Terminal 2: Start Frontend
cd frontend
npm run dev
# Should see: "Local: http://localhost:3000"

# Terminal 3: Test Health Check
curl http://localhost:5000/health
# Expected: {"status":"ok","message":"Timetable OCR API is running"}
```

---

## Frontend Testing

### 1. Visual/UI Testing

#### Desktop View (1920x1080)
- [ ] Header displays correctly with title and subtitle
- [ ] Upload card is centered and responsive
- [ ] Drag-and-drop zone is clearly visible
- [ ] Feature icons display at bottom of card
- [ ] Footer is present

#### Tablet View (768x1024)
- [ ] Layout adjusts for medium screens
- [ ] Upload card takes appropriate width
- [ ] All text remains readable

#### Mobile View (375x667)
- [ ] Accordion layout activates for timetable display
- [ ] Touch interactions work smoothly
- [ ] Upload button is easily tappable
- [ ] No horizontal scrolling

### 2. File Upload Testing

#### Test Case 1: Valid Image Upload
```
Steps:
1. Open http://localhost:3000
2. Drag samples/sample-timetable-basic.txt (or any image if you have one)
3. Observe file preview appears
4. Click "Extract Timetable"
5. Wait for processing
6. Verify timetable displays correctly

Expected Result:
✓ File preview shows filename and size
✓ Progress bar appears during upload
✓ Timetable displays with all days
✓ Time blocks are color-coded
✓ All data is readable
```

#### Test Case 2: Invalid File Type
```
Steps:
1. Try uploading a .exe or .zip file

Expected Result:
✓ Error message displays
✓ Upload is rejected
✓ Error: "Invalid file type..."
```

#### Test Case 3: File Too Large
```
Steps:
1. Try uploading a file > 10MB

Expected Result:
✓ Upload rejected
✓ Error about file size limit
```

#### Test Case 4: Drag and Drop
```
Steps:
1. Drag a valid file over the drop zone
2. Observe visual feedback
3. Drop the file
4. Verify file is accepted

Expected Result:
✓ Drop zone highlights when dragging over
✓ File is accepted on drop
✓ Preview appears immediately
```

### 3. Timetable Display Testing

#### Desktop Grid View
- [ ] All days display side-by-side
- [ ] Time blocks have colored left borders
- [ ] Hover effects work on time blocks
- [ ] Start/end times display correctly
- [ ] Duration calculations are accurate
- [ ] Notes (if any) are visible
- [ ] No layout overflow issues

#### Mobile Accordion View
- [ ] Days are collapsed by default
- [ ] Tapping expands/collapses days
- [ ] Only one day expanded at a time
- [ ] Time blocks display vertically
- [ ] All information remains readable

### 4. Error Handling

#### Test Network Errors
```javascript
// In browser console, simulate offline:
// 1. Open DevTools (F12)
// 2. Go to Network tab
// 3. Select "Offline" from throttling dropdown
// 4. Try uploading a file

Expected Result:
✓ Error message displays
✓ User can try again
✓ No application crash
```

---

## Backend API Testing

### Using cURL

#### Test 1: Health Check
```bash
curl http://localhost:5000/health

# Expected Response:
{
  "status": "ok",
  "message": "Timetable OCR API is running"
}
```

#### Test 2: Basic Text Timetable
```bash
curl -X POST http://localhost:5000/api/timetable/extract \
  -F "file=@samples/sample-timetable-basic.txt" \
  -H "Accept: application/json"

# Expected Response:
{
  "success": true,
  "message": "Timetable extracted successfully",
  "data": {
    "title": "...",
    "days": [...]
  }
}
```

#### Test 3: Detailed Timetable
```bash
curl -X POST http://localhost:5000/api/timetable/extract \
  -F "file=@samples/sample-timetable-detailed.txt"

# Should extract:
- Multiple days
- Time ranges
- Event names
- Notes and reminders
```

#### Test 4: Missing File
```bash
curl -X POST http://localhost:5000/api/timetable/extract

# Expected Response:
{
  "error": "No file uploaded..."
}
```

#### Test 5: Invalid File Type
```bash
# Create a test file
echo "test" > test.exe

curl -X POST http://localhost:5000/api/timetable/extract \
  -F "file=@test.exe"

# Expected Response:
{
  "error": "Invalid file type..."
}

# Cleanup
rm test.exe
```

### Using Postman

1. **Import Collection** (Create these requests):

```json
{
  "info": {
    "name": "Timetable OCR API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/health"
      }
    },
    {
      "name": "Extract Timetable",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/timetable/extract",
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": "samples/sample-timetable-basic.txt"
            }
          ]
        }
      }
    }
  ]
}
```

2. **Run Tests**:
   - Health Check (should return 200 OK)
   - Extract Timetable (should return structured JSON)

---

## End-to-End Testing

### Complete User Journey

```
Test Scenario: Teacher Uploads Timetable
───────────────────────────────────────────

1. SETUP
   ✓ User opens application
   ✓ Sees welcome screen with upload area

2. FILE SELECTION
   ✓ User drags timetable file
   ✓ Drop zone highlights
   ✓ File preview appears
   ✓ Filename and size shown

3. UPLOAD INITIATION
   ✓ User clicks "Extract Timetable"
   ✓ Button becomes disabled
   ✓ Progress bar appears
   ✓ Progress increases to 100%

4. PROCESSING
   ✓ "Processing timetable..." message shows
   ✓ User waits 2-5 seconds
   ✓ No errors occur

5. RESULT DISPLAY
   ✓ Upload area disappears
   ✓ Timetable view appears
   ✓ Title displays correctly
   ✓ All days are present
   ✓ Time blocks are formatted
   ✓ Colors are applied
   ✓ Times are accurate

6. INTERACTION
   ✓ User can scroll through days
   ✓ Hover effects work
   ✓ Mobile view works (if on mobile)
   ✓ Data is readable

7. RESET
   ✓ User clicks "Upload New Timetable"
   ✓ Returns to upload screen
   ✓ Previous data cleared
   ✓ Can upload new file
```

---

## Performance Testing

### Response Time Tests

```bash
# Test 1: Simple timetable (should be fast)
time curl -X POST http://localhost:5000/api/timetable/extract \
  -F "file=@samples/sample-timetable-basic.txt" \
  -o /dev/null -s

# Expected: 2-4 seconds

# Test 2: Complex timetable
time curl -X POST http://localhost:5000/api/timetable/extract \
  -F "file=@samples/sample-timetable-detailed.txt" \
  -o /dev/null -s

# Expected: 3-6 seconds
```

### Load Testing (Optional)

```bash
# Install Apache Bench (if not installed)
# macOS: brew install httpd
# Ubuntu: apt-get install apache2-utils

# Test 10 concurrent requests
ab -n 10 -c 2 -p post_data.txt -T multipart/form-data \
  http://localhost:5000/api/timetable/extract
```

### Memory Usage

```bash
# Monitor backend memory
# While running, check:
ps aux | grep node

# Should remain stable (< 200MB for simple app)
```

---

## Troubleshooting

### Issue: "API key not found"

**Symptoms**: Upload fails immediately with error about API key

**Solution**:
```bash
# Check .env file exists
ls -la backend/.env

# Verify contents
cat backend/.env

# Should see:
# OPENAI_API_KEY=sk-proj-...

# If missing, create it:
cd backend
cp .env.example .env
# Edit .env and add your key

# Restart backend
npm run dev
```

### Issue: "Network Error" or "Failed to fetch"

**Symptoms**: Upload button click does nothing or shows network error

**Solution**:
1. Check backend is running:
   ```bash
   curl http://localhost:5000/health
   ```

2. Check CORS:
   - Backend should have CORS enabled for localhost:3000
   - Check server.js has `app.use(cors())`

3. Check browser console for specific error

### Issue: Extraction Returns Wrong Data

**Symptoms**: Timetable extracted but data is incorrect

**Debugging**:
```bash
# Test with sample files first
curl -X POST http://localhost:5000/api/timetable/extract \
  -F "file=@samples/sample-timetable-basic.txt" | jq

# Check OpenAI API logs
# Look at backend console for API responses
```

**Solutions**:
- Improve prompt in `extractionService.js`
- Use clearer timetable format
- Try different model (gpt-4-turbo)

### Issue: Slow Processing

**Symptoms**: Takes > 10 seconds to extract

**Causes**:
- Large file size
- Complex timetable
- OpenAI API rate limits
- Slow network connection

**Solutions**:
- Compress images before upload
- Check internet speed
- Monitor OpenAI API status
- Implement caching

### Issue: Mobile Layout Broken

**Symptoms**: Mobile view doesn't display correctly

**Solutions**:
1. Clear browser cache
2. Check CSS media queries
3. Test in responsive mode (DevTools)
4. Verify viewport meta tag in index.html

---

## Automated Testing Scripts

### Quick Test Script

Create `test.sh`:

```bash
#!/bin/bash

echo "🧪 Running Timetable OCR Tests..."
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
curl -s http://localhost:5000/health | grep -q "ok" && echo "✅ PASS" || echo "❌ FAIL"

# Test 2: Basic Upload
echo "Test 2: Basic Timetable"
response=$(curl -s -X POST http://localhost:5000/api/timetable/extract \
  -F "file=@samples/sample-timetable-basic.txt")
echo "$response" | grep -q "success" && echo "✅ PASS" || echo "❌ FAIL"

# Test 3: Detailed Upload
echo "Test 3: Detailed Timetable"
response=$(curl -s -X POST http://localhost:5000/api/timetable/extract \
  -F "file=@samples/sample-timetable-detailed.txt")
echo "$response" | grep -q "days" && echo "✅ PASS" || echo "❌ FAIL"

echo ""
echo "🏁 Tests Complete"
```

Run with:
```bash
chmod +x test.sh
./test.sh
```

---

## Test Checklist Summary

### Before Release
- [ ] All UI components render correctly
- [ ] File upload works for all formats
- [ ] Error messages are user-friendly
- [ ] Mobile layout is functional
- [ ] API responds within 5 seconds
- [ ] Extraction accuracy > 90%
- [ ] No memory leaks
- [ ] Works in Chrome, Firefox, Safari
- [ ] Environment variables documented
- [ ] Sample files provided

### Continuous Testing
- [ ] Test after each code change
- [ ] Test with different timetable formats
- [ ] Test error scenarios
- [ ] Test on different devices
- [ ] Monitor API usage and costs

---

## Expected Test Results

### Sample File Expected Outputs

#### sample-timetable-basic.txt
```json
{
  "title": "Weekly Class Timetable - Grade 5A",
  "days": [
    {
      "day": "Monday",
      "blocks": [
        {
          "event": "Registration & Morning Assembly",
          "startTime": "08:45",
          "endTime": "09:00"
        },
        {
          "event": "Mathematics",
          "startTime": "09:00",
          "endTime": "10:00"
        }
        // ... more blocks
      ]
    }
    // ... more days
  ]
}
```

---

**Happy Testing! 🧪✨**

For issues or questions, check:
- Backend logs in Terminal 1
- Frontend console (F12)
- Network tab in DevTools
- OpenAI API status page

