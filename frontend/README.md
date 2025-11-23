# Timetable OCR Frontend

Modern React frontend for the Timetable OCR application.

## Features

- 🎨 Beautiful, responsive UI
- 📤 Drag & drop file upload
- 📊 Dynamic timetable visualization
- 📱 Mobile-optimized accordion view
- 🖥️ Desktop grid layout
- ⚡ Real-time upload progress
- 🎯 Support for multiple file formats

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── FileUpload.jsx      # File upload component
│   ├── FileUpload.css
│   ├── TimetableDisplay.jsx # Timetable visualization
│   └── TimetableDisplay.css
├── App.jsx                  # Main application
├── App.css
├── main.jsx                 # Entry point
└── index.css                # Global styles
```

## Features

### File Upload
- Drag and drop support
- File type validation
- Size limit (10MB)
- Upload progress indicator
- File preview

### Timetable Display
- **Desktop**: Multi-column grid layout showing all days
- **Mobile**: Accordion view for easy navigation
- Color-coded time blocks
- Duration calculations
- Notes display
- Responsive design

## Tech Stack

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Axios**: HTTP client
- **CSS3**: Styling with custom properties

