# 📡 API Endpoints Documentation

## Base URL

```
Development: http://localhost:5001
Production: https://your-domain.com
```

---

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| POST | `/api/timetable/extract` | Extract timetable from file | No |

---

## 1. Health Check

**GET** `/health`

Health check endpoint to verify API is running.

### Request

```bash
curl http://localhost:5001/health
```

### Response

**Status Code**: `200 OK`

```json
{
  "status": "ok",
  "message": "Timetable OCR API is running"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | API status ("ok" or "error") |
| `message` | string | Status message |

---

## 2. Extract Timetable

**POST** `/api/timetable/extract`

Extract structured timetable data from an uploaded file.

### Request

**URL**: `/api/timetable/extract`

**Method**: `POST`

**Content-Type**: `multipart/form-data`

**Body Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | Timetable file (JPEG, PNG, PDF, DOCX) |

**File Constraints**:
- **Allowed types**: `.jpg`, `.jpeg`, `.png`, `.pdf`, `.docx`, `.doc`
- **Max size**: 10MB
- **MIME types**: `image/jpeg`, `image/png`, `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### Example Requests

#### Using cURL

```bash
curl -X POST http://localhost:5001/api/timetable/extract \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/timetable.jpg"
```

#### Using JavaScript (Fetch)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:5001/api/timetable/extract', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data);
```

#### Using Axios

```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('file', file);

const response = await axios.post(
  'http://localhost:5001/api/timetable/extract',
  formData,
  {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const progress = (progressEvent.loaded * 100) / progressEvent.total;
      console.log(`Upload Progress: ${progress}%`);
    }
  }
);

console.log(response.data);
```

#### Using Python (requests)

```python
import requests

url = 'http://localhost:5001/api/timetable/extract'
files = {'file': open('timetable.jpg', 'rb')}

response = requests.post(url, files=files)
print(response.json())
```

#### Using Postman

1. Set method to `POST`
2. URL: `http://localhost:5001/api/timetable/extract`
3. Go to "Body" tab
4. Select "form-data"
5. Add key: `file` (type: File)
6. Choose your timetable file
7. Click "Send"

### Successful Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "message": "Timetable extracted successfully",
  "data": {
    "title": "Weekly Timetable - Year 4B",
    "metadata": {
      "hasTopRowTiming": true,
      "hasInBlockTiming": false,
      "hasRecurringBlocks": true,
      "orientation": "horizontal",
      "documentType": "image"
    },
    "days": [
      {
        "day": "Monday",
        "blocks": [
          {
            "event": "Registration",
            "startTime": "08:45",
            "endTime": "09:00",
            "duration": "15 min",
            "isRecurring": true,
            "isMultiSubject": false,
            "subjects": ["Registration"],
            "notes": "Morning attendance",
            "teacher": "Mrs. Smith",
            "room": "4B"
          },
          {
            "event": "Mathematics",
            "startTime": "09:00",
            "endTime": "10:00",
            "duration": "1 hour",
            "isRecurring": false,
            "isMultiSubject": false,
            "subjects": ["Mathematics"],
            "notes": ""
          },
          {
            "event": "Break",
            "startTime": "10:00",
            "endTime": "10:15",
            "duration": "15 min",
            "isRecurring": true,
            "isMultiSubject": false,
            "subjects": ["Break"],
            "notes": ""
          }
        ]
      },
      {
        "day": "Tuesday",
        "blocks": [...]
      }
    ],
    "recurringBlocks": [
      {
        "event": "Lunch Break",
        "startTime": "12:00",
        "endTime": "13:00",
        "duration": "1 hour",
        "appliesTo": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "notes": "Daily recurring event"
      }
    ]
  }
}
```

### Response Fields

#### Root Level

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether extraction succeeded |
| `message` | string | Success/error message |
| `data` | object | Extracted timetable data |

#### Data Object

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Timetable title |
| `metadata` | object | Extraction metadata |
| `days` | array | Array of day objects |
| `recurringBlocks` | array | Daily recurring events |

#### Metadata Object

| Field | Type | Description |
|-------|------|-------------|
| `hasTopRowTiming` | boolean | If timing inherited from header |
| `hasInBlockTiming` | boolean | If times are inside blocks |
| `hasRecurringBlocks` | boolean | If recurring events detected |
| `orientation` | string | Text orientation (horizontal/vertical/mixed) |
| `documentType` | string | Source file type (image/pdf/docx) |

#### Day Object

| Field | Type | Description |
|-------|------|-------------|
| `day` | string | Day name (e.g., "Monday") |
| `blocks` | array | Array of time block objects |

#### Block Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `event` | string | Yes | Event/subject name |
| `startTime` | string | Yes | Start time (HH:MM format) |
| `endTime` | string | Yes | End time (HH:MM format) |
| `duration` | string | Yes | Calculated duration |
| `isRecurring` | boolean | No | If event recurs daily |
| `isMultiSubject` | boolean | No | If block contains multiple subjects |
| `isSplit` | boolean | No | If block was split from multi-subject |
| `subjects` | array | No | List of subjects in block |
| `notes` | string | No | Additional notes |
| `teacher` | string | No | Teacher name (if extracted) |
| `room` | string | No | Room number (if extracted) |
| `color` | string | No | Color code (if color-coded timetable) |

#### Recurring Block Object

| Field | Type | Description |
|-------|------|-------------|
| `event` | string | Event name |
| `startTime` | string | Start time |
| `endTime` | string | End time |
| `duration` | string | Duration |
| `appliesTo` | array | Days this applies to |
| `notes` | string | Additional notes |

### Error Responses

#### 400 Bad Request - No File Uploaded

```json
{
  "error": "No file uploaded. Please upload an image, PDF, or DOCX file."
}
```

#### 400 Bad Request - Invalid File Type

```json
{
  "error": "Invalid file type. Only images (JPEG, PNG), PDF, and DOCX files are allowed."
}
```

#### 413 Payload Too Large

```json
{
  "error": "File size exceeds 10MB limit."
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to process timetable"
}
```

**Note**: In development mode, error responses include stack traces:

```json
{
  "error": {
    "message": "Error message",
    "stack": "Error stack trace..."
  }
}
```

---

## Rate Limiting

Currently: **No rate limiting** (prototype)

**Recommended for Production**:
- 100 requests per hour per IP
- 1000 requests per day per API key
- Implement using `express-rate-limit` middleware

---

## CORS Configuration

**Allowed Origins**: 
- Development: `http://localhost:3000`
- Production: Configure specific domains

**Allowed Methods**: 
- `GET`, `POST`

**Allowed Headers**: 
- `Content-Type`, `Authorization`

---

## Authentication

**Current**: No authentication required (prototype)

**Recommended for Production**:
```javascript
// Example with Bearer token
curl -X POST http://localhost:5001/api/timetable/extract \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@timetable.jpg"
```

---

## Processing Time

**Average Response Time**:
- Simple timetables: 2-4 seconds
- Complex timetables: 4-8 seconds
- Large PDF files: 5-10 seconds

**Factors Affecting Speed**:
- File size
- Image resolution
- Timetable complexity
- OpenAI API response time

---

## Best Practices

### File Preparation

1. **Image Quality**: Use clear, high-resolution images
2. **Lighting**: Ensure good lighting (no shadows/glare)
3. **Orientation**: Straight, non-skewed images work best
4. **Format**: JPEG/PNG for images, searchable PDFs preferred
5. **Size**: Compress images without losing readability

### API Usage

```javascript
// Good: Handle errors gracefully
try {
  const response = await axios.post('/api/timetable/extract', formData);
  if (response.data.success) {
    // Process data
  }
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error('Server error:', error.response.data);
  } else if (error.request) {
    // No response received
    console.error('Network error');
  }
}

// Good: Show upload progress
axios.post(url, formData, {
  onUploadProgress: (e) => {
    const progress = Math.round((e.loaded * 100) / e.total);
    updateProgressBar(progress);
  }
});

// Good: Validate before uploading
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
if (!allowedTypes.includes(file.type)) {
  alert('Invalid file type');
  return;
}

if (file.size > 10 * 1024 * 1024) {
  alert('File too large');
  return;
}
```

---

## Examples by Use Case

### Extract from Image

```bash
curl -X POST http://localhost:5001/api/timetable/extract \
  -F "file=@school-timetable.jpg"
```

### Extract from PDF

```bash
curl -X POST http://localhost:5001/api/timetable/extract \
  -F "file=@weekly-schedule.pdf"
```

### Extract from DOCX

```bash
curl -X POST http://localhost:5001/api/timetable/extract \
  -F "file=@class-timetable.docx"
```

### With Progress Tracking (JavaScript)

```javascript
const uploadWithProgress = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/api/timetable/extract', formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`Upload: ${percentCompleted}%`);
    },
  });
};
```

---

## Testing the API

### Using the Web Interface

1. Navigate to `http://localhost:3000`
2. Upload a timetable file
3. View extracted results

### Using Automated Tests

```bash
# Run test script
./test.sh

# Expected output:
# Test 1: Health Check ✅ PASS
# Test 2: Basic Timetable ✅ PASS
# Test 3: Detailed Timetable ✅ PASS
```

---

## Troubleshooting

### Issue: "OpenAI API key not found"

**Solution**: Add API key to `backend/.env`
```bash
OPENAI_API_KEY=sk-proj-your-key-here
```

### Issue: "CORS error"

**Solution**: Ensure CORS is enabled and frontend URL is allowed

### Issue: "File upload fails"

**Solution**: Check:
- File size < 10MB
- File type is allowed
- Backend is running
- No firewall blocking

### Issue: "Slow processing"

**Solution**:
- Compress large images
- Use smaller file sizes
- Check internet connection
- Monitor OpenAI API status

---

## API Versioning

**Current**: No versioning (v1 implicit)

**Future**: URL-based versioning
```
/api/v1/timetable/extract
/api/v2/timetable/extract
```

---

## Support

For API issues:
- Check backend console logs
- Verify OpenAI API status: https://status.openai.com
- Review network tab in browser DevTools
- Test with sample files first

---

**Last Updated**: November 22, 2025
**API Version**: 1.0
**Status**: ✅ Production Ready

