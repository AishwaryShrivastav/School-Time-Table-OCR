# Timetable OCR Backend

Backend API for extracting timetable data from uploaded files (images, PDFs, DOCX).

## Features

- 📤 File upload support (JPEG, PNG, PDF, DOCX)
- 🤖 OpenAI GPT-4 Vision API integration
- 📊 Structured JSON response
- 🔄 Automatic file cleanup
- 🛡️ Error handling and validation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_actual_api_key_here
PORT=5000
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### POST /api/timetable/extract

Extract timetable data from an uploaded file.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` (image/PDF/DOCX file)

**Response:**
```json
{
  "success": true,
  "message": "Timetable extracted successfully",
  "data": {
    "title": "Weekly Timetable",
    "days": [
      {
        "day": "Monday",
        "blocks": [
          {
            "event": "Registration",
            "startTime": "09:00",
            "endTime": "09:15",
            "duration": "15 minutes",
            "notes": ""
          }
        ]
      }
    ]
  }
}
```

### GET /health

Health check endpoint.

## Testing with cURL

```bash
curl -X POST http://localhost:5000/api/timetable/extract \
  -F "file=@/path/to/your/timetable.jpg"
```

## Architecture

- **Express.js**: Web framework
- **Multer**: File upload handling
- **OpenAI API**: Vision and text analysis
- **pdf-parse**: PDF text extraction
- **mammoth**: DOCX text extraction

