# Timetable OCR Platform - Quick Start Guide

## 🚀 Installation

### Option 1: Using Setup Script (Recommended)

**On macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**On Windows:**
```bash
setup.bat
```

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your OpenAI API key
```

**Frontend:**
```bash
cd frontend
npm install
```

## 🔑 Getting an OpenAI API Key

1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to `backend/.env`:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

## 🎯 Running the Application

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```
Server will start on `http://localhost:5000`

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
Frontend will start on `http://localhost:3000`

## 📋 Testing the Application

### Method 1: Using the Web Interface
1. Open `http://localhost:3000` in your browser
2. Drag and drop a timetable file or click "Browse Files"
3. Click "Extract Timetable"
4. View your extracted timetable!

### Method 2: Using cURL (API Testing)
```bash
# Test with a sample file
curl -X POST http://localhost:5000/api/timetable/extract \
  -F "file=@samples/sample-timetable-basic.txt"
```

### Method 3: Using Postman
1. Create a POST request to `http://localhost:5000/api/timetable/extract`
2. Set Body type to `form-data`
3. Add a key named `file` with type `File`
4. Select a timetable file
5. Send the request

## 📁 Supported File Formats

- **Images**: JPEG, JPG, PNG
- **Documents**: PDF, DOCX
- **Max file size**: 10MB

## 🎨 Features Demonstration

### Desktop View
- Open on a laptop/desktop to see the multi-column grid layout
- All days displayed side-by-side
- Hover effects on time blocks

### Mobile View
- Open on mobile or resize browser window
- Accordion-style layout
- Tap to expand/collapse days

## 🔍 How It Works

1. **File Upload**: User uploads a timetable in any supported format
2. **Processing**: 
   - Images → OpenAI Vision API analyzes directly
   - PDFs → Text extraction → OpenAI analysis
   - DOCX → Text extraction → OpenAI analysis
3. **Extraction**: AI identifies days, time blocks, events, and notes
4. **Display**: Beautiful, responsive visualization of the timetable

## 🐛 Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify OpenAI API key is set in `.env`
- Check Node.js version (requires 18+)

### Frontend won't start
- Check if port 3000 is available
- Try deleting `node_modules` and running `npm install` again

### API errors
- Verify OpenAI API key is valid
- Check your OpenAI account has credits
- Check console logs for detailed errors

### CORS errors
- Make sure backend is running on port 5000
- Frontend proxy is configured in `vite.config.js`

## 💡 Tips

1. **Better Results**: Use clear, well-lit images of timetables
2. **File Size**: Compress large images before uploading
3. **Format**: Structured timetables work best (tables, clear time blocks)
4. **Testing**: Use the sample files in `samples/` directory first

## 📊 Sample Files

Located in `samples/` directory:
- `sample-timetable-basic.txt` - Simple weekly timetable
- `sample-timetable-detailed.txt` - Complex timetable with notes

## 🚀 Next Steps

Once the basic system is working, you can:

1. **Add Authentication**: Implement user accounts
2. **Database**: Store extracted timetables
3. **Export Features**: Download as PDF/iCal
4. **Edit Capability**: Manual adjustments after extraction
5. **Multiple Formats**: Support more file types

## 📞 Support

If you encounter issues:
1. Check the console logs (both backend and frontend)
2. Verify API key is correct
3. Try with sample files first
4. Check network tab in browser dev tools

---

**Happy Timetable Extracting! 📅✨**

