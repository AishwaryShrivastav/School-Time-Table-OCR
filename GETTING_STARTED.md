# ✅ Getting Started Checklist

Follow this checklist to get your Timetable OCR Platform up and running!

## 📋 Pre-Installation

- [ ] **Node.js 18+** is installed
  ```bash
  node --version
  # Should show v18.x.x or higher
  ```

- [ ] **npm** is available
  ```bash
  npm --version
  ```

- [ ] **OpenAI Account** created
  - Go to https://platform.openai.com
  - Sign up or log in

- [ ] **OpenAI API Key** obtained
  - Navigate to API Keys section
  - Create new secret key
  - Copy and save it securely

## 🛠️ Installation Steps

### Option A: Automated Setup (Recommended)

- [ ] Navigate to project directory
  ```bash
  cd /Users/aishwary/Development/TimeTableOCR_C
  ```

- [ ] Run setup script
  ```bash
  # macOS/Linux
  ./setup.sh
  
  # Windows
  setup.bat
  ```

- [ ] Setup completes without errors

### Option B: Manual Setup

- [ ] Install backend dependencies
  ```bash
  cd backend
  npm install
  ```

- [ ] Install frontend dependencies
  ```bash
  cd frontend
  npm install
  ```

## 🔑 Configuration

- [ ] Create backend `.env` file
  ```bash
  cd backend
  cp .env.example .env
  ```

- [ ] Add OpenAI API key to `.env`
  ```bash
  # Edit backend/.env
  OPENAI_API_KEY=sk-proj-your-actual-api-key-here
  PORT=5000
  NODE_ENV=development
  ```

- [ ] Verify `.env` file is not tracked by git
  ```bash
  git status
  # Should NOT show .env in changes
  ```

## 🚀 First Run

### Terminal 1: Backend

- [ ] Start backend server
  ```bash
  cd backend
  npm run dev
  ```

- [ ] Verify backend is running
  - Should see: "🚀 Server is running on port 5000"
  - No error messages appear

- [ ] Test health endpoint
  ```bash
  # In a new terminal
  curl http://localhost:5000/health
  # Should return: {"status":"ok","message":"..."}
  ```

### Terminal 2: Frontend

- [ ] Start frontend server
  ```bash
  cd frontend
  npm run dev
  ```

- [ ] Verify frontend is running
  - Should see: "Local: http://localhost:3000"
  - No compilation errors

- [ ] Open in browser
  ```
  http://localhost:3000
  ```

## 🧪 First Test

- [ ] **Visual Check**: Homepage loads correctly
  - Header with "📅 Timetable OCR" visible
  - Upload card displays
  - Drag-and-drop zone visible
  - No console errors (F12)

- [ ] **Upload Test**: Test with sample file
  - Click "Browse Files" or drag-and-drop
  - Select `samples/sample-timetable-basic.txt`
  - File preview appears
  - Click "Extract Timetable"
  - Processing completes in 2-5 seconds
  - Timetable displays with days and time blocks

- [ ] **Mobile Test**: Responsive design works
  - Resize browser to mobile width (375px)
  - Accordion layout activates
  - Can expand/collapse days
  - All text is readable

- [ ] **Reset Test**: Can upload new file
  - Click "Upload New Timetable"
  - Returns to upload screen
  - Can upload another file

## 🔍 Troubleshooting Checks

If anything fails, verify:

### Backend Issues
- [ ] Port 5000 is not in use by another app
- [ ] OpenAI API key is correct (starts with `sk-`)
- [ ] `.env` file exists in backend directory
- [ ] No syntax errors in backend code
- [ ] All backend dependencies installed

### Frontend Issues
- [ ] Port 3000 is not in use by another app
- [ ] Backend is running before starting frontend
- [ ] No syntax errors in frontend code
- [ ] All frontend dependencies installed
- [ ] Browser is up to date

### API Issues
- [ ] OpenAI API key is valid and active
- [ ] You have credits in your OpenAI account
- [ ] Internet connection is stable
- [ ] No firewall blocking requests

## 📊 System Verification

Run the automated test script:

- [ ] Make test script executable (first time only)
  ```bash
  chmod +x test.sh
  ```

- [ ] Run tests
  ```bash
  ./test.sh
  ```

- [ ] All tests pass
  - ✅ Health Check
  - ✅ Basic Timetable Extraction
  - ✅ Detailed Timetable Extraction
  - ✅ Error Handling

## 📚 Documentation Review

Familiarize yourself with:

- [ ] **README.md** - Project overview
- [ ] **QUICKSTART.md** - Quick setup guide
- [ ] **ARCHITECTURE.md** - System design
- [ ] **ENV_GUIDE.md** - Environment variables
- [ ] **TESTING.md** - Testing procedures
- [ ] **PROJECT_SUMMARY.md** - Complete summary

## 🎯 Next Steps

Now that everything is working:

- [ ] Test with your own timetable files
- [ ] Experiment with different formats
- [ ] Explore the code to understand how it works
- [ ] Try modifying the UI colors/styles
- [ ] Test on different devices
- [ ] Share with colleagues for feedback

## 💡 Best Practices

- [ ] Keep your API key secret
- [ ] Don't commit `.env` files
- [ ] Monitor OpenAI API usage
- [ ] Set up billing alerts
- [ ] Backup your work regularly
- [ ] Test changes in development first

## 🐛 Known Limitations

Be aware of:

- [ ] Maximum file size is 10MB
- [ ] Processing takes 2-5 seconds
- [ ] OpenAI API costs money (track usage)
- [ ] Works best with clearly formatted timetables
- [ ] Handwritten text may be less accurate

## 🎉 Success Indicators

You're all set if:

- ✅ Both servers start without errors
- ✅ Frontend loads in browser
- ✅ Can upload a sample file
- ✅ Timetable extracts correctly
- ✅ Mobile layout works
- ✅ No console errors
- ✅ All tests pass

## 📞 Need Help?

If stuck:

1. Check the **TROUBLESHOOTING** section in TESTING.md
2. Review backend console logs
3. Check browser console (F12)
4. Verify all checklist items above
5. Test with sample files first
6. Check OpenAI API status: https://status.openai.com

## 🔄 Daily Workflow

For future development sessions:

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# Browser
open http://localhost:3000
```

## 🎓 Learning Path

Suggested order to explore the codebase:

1. [ ] **backend/server.js** - Understand server setup
2. [ ] **backend/routes/timetable.js** - See API endpoints
3. [ ] **backend/services/extractionService.js** - Study AI integration
4. [ ] **frontend/src/App.jsx** - Learn React structure
5. [ ] **frontend/src/components/FileUpload.jsx** - File handling
6. [ ] **frontend/src/components/TimetableDisplay.jsx** - Data visualization

---

## ✨ Congratulations!

You've successfully set up the Timetable OCR Platform! 🎊

**Ready to extract some timetables?** 📅✨

---

*Completed on: ________________*

*Notes:*
_____________________________________________
_____________________________________________
_____________________________________________

