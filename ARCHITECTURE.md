# 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│                     (React Frontend)                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                             │  │
│  │  ┌──────────────┐         ┌────────────────────────┐      │  │
│  │  │ FileUpload   │────────▶│  TimetableDisplay      │      │  │
│  │  │ Component    │         │  Component             │      │  │
│  │  └──────────────┘         └────────────────────────┘      │  │
│  │        │                                                    │  │
│  │        │ HTTP POST (multipart/form-data)                   │  │
│  │        ▼                                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬──────────────────────────────┘
                                    │
                                    │ Axios HTTP Request
                                    │ Port 3000 → 5000
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API SERVER                          │
│                     (Node.js + Express)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                             │  │
│  │  ┌──────────────┐         ┌────────────────────────┐      │  │
│  │  │   Express    │────────▶│  Timetable Routes      │      │  │
│  │  │   Server     │         │  /api/timetable/*      │      │  │
│  │  └──────────────┘         └────────────────────────┘      │  │
│  │                                     │                       │  │
│  │                                     ▼                       │  │
│  │  ┌──────────────┐         ┌────────────────────────┐      │  │
│  │  │   Multer     │────────▶│  Extraction Service    │      │  │
│  │  │   (Upload)   │         │  extractionService.js  │      │  │
│  │  └──────────────┘         └────────────────────────┘      │  │
│  │                                     │                       │  │
│  └─────────────────────────────────────┼───────────────────────┘  │
└─────────────────────────────────────────┼───────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
         ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
         │  Image Handler   │  │   PDF Handler    │  │  DOCX Handler    │
         │  (Vision API)    │  │  (pdf-parse)     │  │  (mammoth)       │
         └──────────────────┘  └──────────────────┘  └──────────────────┘
                    │                     │                     │
                    │                     ▼                     │
                    │           ┌──────────────────┐            │
                    └──────────▶│   OpenAI API     │◀───────────┘
                                │   GPT-4 Vision   │
                                └──────────────────┘
                                          │
                                          ▼
                                ┌──────────────────┐
                                │  Structured      │
                                │  JSON Response   │
                                └──────────────────┘
```

## 🔄 Data Flow

### 1. Upload Phase
```
User → Selects File → FileUpload Component → Validates File Type/Size
```

### 2. Processing Phase
```
Frontend → POST /api/timetable/extract → Backend Router → Multer → Save File
```

### 3. Extraction Phase
```
Saved File → Check Extension → Route to Handler:
  - .jpg/.png → Vision API (direct image analysis)
  - .pdf      → Extract Text → OpenAI API
  - .docx     → Extract Text → OpenAI API
```

### 4. AI Analysis Phase
```
OpenAI API → Analyzes Content → Identifies:
  - Days of the week
  - Time blocks
  - Event names
  - Start/end times
  - Additional notes
```

### 5. Response Phase
```
Structured JSON ← Backend ← Frontend → TimetableDisplay Component → Renders
```

## 📦 Component Breakdown

### Backend Components

1. **server.js**
   - Express app initialization
   - Middleware setup (CORS, body-parser)
   - Route registration
   - Error handling

2. **routes/timetable.js**
   - File upload endpoint
   - Request validation
   - Service invocation
   - Response formatting

3. **services/extractionService.js**
   - File type detection
   - Format-specific processing
   - OpenAI API integration
   - Data normalization

### Frontend Components

1. **App.jsx**
   - Main application container
   - State management
   - Component orchestration

2. **FileUpload.jsx**
   - Drag-and-drop interface
   - File validation
   - Upload progress
   - Error handling

3. **TimetableDisplay.jsx**
   - Grid layout (desktop)
   - Accordion layout (mobile)
   - Time block rendering
   - Responsive design

## 🔐 Security Features

- ✅ File type validation (whitelist)
- ✅ File size limits (10MB max)
- ✅ Automatic file cleanup
- ✅ Environment variable protection
- ✅ CORS configuration
- ✅ Error sanitization

## 🎨 Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI framework |
| Frontend | Vite | Build tool & dev server |
| Frontend | Axios | HTTP client |
| Frontend | CSS3 | Styling & animations |
| Backend | Node.js | Runtime environment |
| Backend | Express | Web framework |
| Backend | Multer | File upload handling |
| Backend | OpenAI API | AI-powered extraction |
| Backend | pdf-parse | PDF text extraction |
| Backend | mammoth | DOCX text extraction |

## 📊 API Response Format

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
            "event": "Mathematics",
            "startTime": "09:00",
            "endTime": "10:00",
            "duration": "1 hour",
            "notes": "Bring calculator"
          }
        ]
      }
    ]
  }
}
```

## 🚀 Performance Considerations

- **File Processing**: Async/await for non-blocking operations
- **Memory Management**: Automatic file cleanup after processing
- **Response Time**: ~2-5 seconds for typical timetables
- **Caching**: Frontend components memoized with React.memo (can be added)
- **Error Recovery**: Graceful degradation with user-friendly messages

## 🔮 Future Enhancements

1. **Authentication**: JWT-based user sessions
2. **Database**: PostgreSQL/MongoDB for data persistence
3. **Caching**: Redis for API response caching
4. **Queue System**: Bull/RabbitMQ for handling multiple uploads
5. **WebSockets**: Real-time processing updates
6. **Export**: PDF/iCal/CSV export functionality
7. **Editing**: In-app timetable modification
8. **Templates**: Pre-defined timetable templates
9. **Sharing**: Public/private timetable sharing links
10. **Analytics**: Usage statistics and insights

