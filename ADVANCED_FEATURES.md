# Advanced Timetable Extraction Features

This document explains the advanced features implemented for robust timetable extraction.

## 🎯 Supported Timetable Variations

### 1. Fixed Daily Blocks (Recurring Events)

**Problem:** Some events occur at the same time every day (e.g., Lunch, Registration, Morning Assembly).

**Solution:**
- AI identifies recurring patterns across days
- Marks blocks with `isRecurring: true`
- Displays with **🔄 Daily** badge
- Uses dashed borders to indicate repetition
- Backend automatically applies recurring blocks to all specified days

**Example:**
```json
{
  "recurringBlocks": [
    {
      "event": "Lunch Break",
      "startTime": "12:00",
      "endTime": "13:00",
      "appliesTo": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    }
  ]
}
```

---

### 2. Top-Row Timing Inheritance

**Problem:** Some timetables show timing in the header row that applies to all days below.

**Solution:**
- AI detects header row timing patterns
- Applies timing to all days in that column
- Handles cases where specific days override the default timing
- Metadata flag: `hasTopRowTiming: true`

**Example Timetable Format:**
```
           9:00-10:00    10:00-11:00    11:00-12:00
Monday     Math          English        Science
Tuesday    Math          Reading        History
Wednesday  Math          Writing        Geography
```

All days inherit the top-row timings unless specified otherwise.

---

### 3. Multiple Subjects in One Block

**Problem:** A single time slot might contain multiple subjects without specified durations.

**Solution:**
- AI detects multi-subject blocks (e.g., "Math / Science")
- Marks with `isMultiSubject: true`
- Backend splits time evenly among subjects
- Each split shows **✂️ Split** badge
- Displays with striped background pattern
- Preserves original block information in notes

**Example:**
```json
{
  "event": "Math / Science",
  "startTime": "09:00",
  "endTime": "11:00",
  "isMultiSubject": true,
  "subjects": ["Mathematics", "Science"]
}
```

**After Processing:**
```json
[
  {
    "event": "Mathematics",
    "startTime": "09:00",
    "endTime": "10:00",
    "isSplit": true,
    "notes": "Part of: Math / Science"
  },
  {
    "event": "Science",
    "startTime": "10:00",
    "endTime": "11:00",
    "isSplit": true,
    "notes": "Part of: Math / Science"
  }
]
```

---

### 4. Vertical and Horizontal Text

**Problem:** Timetables may have text rotated 90 degrees or in various orientations.

**Solution:**
- OpenAI GPT-4 Vision can read text in any orientation
- Enhanced prompt explicitly instructs to "rotate understanding"
- Handles sideways labels, vertical day names, rotated headers
- Metadata flag: `orientation: "horizontal/vertical/mixed"`

**Prompt Enhancement:**
```
"Read both vertical and horizontal text. Rotate your understanding 
to capture sideways labels."
```

---

### 5. Optional In-Block Timings

**Problem:** Some timetables have detailed times inside blocks, some don't.

**Solution:**
- AI prioritizes in-block timings when present
- Falls back to column/row headers when not
- Estimates based on visual spacing if no timings found
- Works seamlessly with or without detailed time annotations
- Metadata flag: `hasInBlockTiming: true/false`

**Examples:**

**With In-Block Timings:**
```
┌─────────────────┐
│  Mathematics    │
│  9:00 - 10:30   │
└─────────────────┘
```

**Without In-Block Timings:**
```
9:00 ─────────────
     Mathematics
10:30 ────────────
```

Both formats are extracted correctly!

---

## 🔧 Backend Processing

### Post-Processing Pipeline

```javascript
extractTimetable(file)
  ↓
AI Extraction (handles all variations)
  ↓
postProcessTimetable(data)
  ↓
  ├─ Apply recurring blocks to all days
  ├─ Sort blocks by start time
  ├─ Split multi-subject blocks
  └─ Calculate durations
  ↓
Return structured data
```

### Key Functions

1. **`postProcessTimetable()`**: Main post-processing
2. **`parseTime()`**: Parse various time formats
3. **`getMinutesDuration()`**: Calculate duration in minutes
4. **`addMinutesToTime()`**: Time arithmetic
5. **`calculateDurationFromTimes()`**: Format duration strings

---

## 🎨 UI Features

### Visual Indicators

| Feature | Badge | Visual Style |
|---------|-------|--------------|
| Recurring Block | 🔄 Daily | Dashed border, gray background |
| Split Subject | ✂️ Split | Striped pattern, purple tint |
| Normal Block | - | Solid border, subject color |

### Color Coding

- **Cyan** (#06b6d4) - Math/Numeracy
- **Green** (#10b981) - English/Writing/Literacy
- **Lime** (#a3e635) - PE/Play/Physical
- **Yellow** (#fbbf24) - Music
- **Orange** (#f97316) - Art/Assembly
- **Purple** (#8b5cf6) - Science
- **Red** (#ef4444) - French/Languages
- **Gray** (#94a3b8) - Breaks/Lunch/Recurring

---

## 📊 Enhanced API Response

```json
{
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
          "isSplit": true,
          "notes": "Part of: Math / Problem Solving"
        }
      ]
    }
  ],
  "recurringBlocks": [
    {
      "event": "Lunch Break",
      "startTime": "12:00",
      "endTime": "13:00",
      "duration": "1 hour",
      "appliesTo": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    }
  ]
}
```

---

## 🧪 Testing Scenarios

### Test Case 1: Simple Daily Structure
```
Monday-Friday: Same structure each day
- 9:00-10:00: Subject varies
- 12:00-13:00: Lunch (recurring)
- 14:00-15:00: Subject varies
```
**Expected**: Lunch marked as recurring on all days

### Test Case 2: Top-Row Timing
```
        Period 1     Period 2     Period 3
        9-10         10-11        11-12
Mon     Math         English      Science
Tue     History      Math         Art
```
**Expected**: All days use header timings

### Test Case 3: Multi-Subject Block
```
Monday 9:00-11:00: Math / Science / Reading
```
**Expected**: Split into 3 blocks of 40 minutes each

### Test Case 4: Mixed Orientations
```
Vertical day labels on left
Horizontal subject names
Rotated timing at top
```
**Expected**: All text extracted correctly

### Test Case 5: Sparse Timing
```
Only start times given, no end times
Or only column headers, no in-block times
```
**Expected**: Duration estimated from visual spacing

---

## 🚀 Usage Examples

### Upload and Extract
```bash
curl -X POST http://localhost:5001/api/timetable/extract \
  -F "file=@complex-timetable.jpg"
```

### Response Handling
```javascript
// Frontend automatically:
// 1. Displays recurring blocks with 🔄 badge
// 2. Shows split subjects with ✂️ badge
// 3. Color codes by subject type
// 4. Sorts chronologically
// 5. Calculates durations
```

---

## 🎯 Benefits

✅ **Robust**: Handles all real-world timetable formats
✅ **Accurate**: Intelligently interprets timing patterns
✅ **Flexible**: Works with or without detailed annotations
✅ **Smart**: Identifies and applies recurring patterns
✅ **Visual**: Clear indicators for special block types
✅ **Faithful**: Preserves original information and formatting

---

## 📝 Notes for Teachers

When uploading timetables:

1. **Any format works**: Typed, scanned, photo, handwritten
2. **Color helps**: Color-coded subjects aid recognition
3. **Labels matter**: Clear subject names improve accuracy
4. **Timing flexibility**: Works with or without detailed times
5. **Patterns detected**: Recurring events automatically identified

---

**The system now provides a true digital replica of your timetable, ready for editing and customization!** ✨

