# Sample Timetable Files

This directory contains sample timetable files for testing the Timetable OCR system.

## Testing the System

You can use these sample files to test the API:

### Using cURL

```bash
# Test with an image
curl -X POST http://localhost:5000/api/timetable/extract \
  -F "file=@samples/sample-timetable.txt"

# Test with a PDF
curl -X POST http://localhost:5000/api/timetable/extract \
  -F "file=@samples/sample-timetable.pdf"

# Test with a DOCX
curl -X POST http://localhost:5000/api/timetable/extract \
  -F "file=@samples/sample-timetable.docx"
```

### Using the Frontend

1. Start both backend and frontend servers
2. Go to `http://localhost:3000`
3. Upload any of the sample files

## Sample Timetable Formats

The samples demonstrate different timetable layouts:

- **sample-timetable-basic.txt**: Simple text-based timetable
- **sample-timetable-detailed.txt**: More complex timetable with notes
- Future: Add actual image, PDF, and DOCX samples

## Creating Your Own Test Files

You can create your own timetable files in any of the supported formats:

1. **Images**: Take a photo of a physical timetable or create one in an image editor
2. **PDFs**: Export a timetable from any document editor
3. **DOCX**: Create a table-based timetable in Microsoft Word

The AI will adapt to your format automatically!

