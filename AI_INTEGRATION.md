# 🤖 AI Integration & LLM Prompt Logic

## Overview

This document details the AI integration strategy, prompt engineering, and parsing logic used in the Timetable OCR Platform.

---

## AI Stack

### Primary AI Service

**OpenAI GPT-4 Vision (gpt-4o)**

- **Model**: `gpt-4o`
- **API Version**: Latest (via OpenAI SDK v4.20.1+)
- **Capabilities**:
  - Vision: Analyzes images directly
  - Text: Processes extracted text from PDFs/DOCX
  - JSON Mode: Structured output
  - Context: 4000 token responses

### Why GPT-4 Vision?

1. **Multi-modal**: Handles both images and text
2. **Context Understanding**: Grasps complex timetable structures
3. **Pattern Recognition**: Identifies recurring blocks
4. **Flexibility**: Adapts to various formats
5. **JSON Output**: Structured, parseable responses
6. **Accuracy**: High precision for text extraction

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT REQUEST                            │
│              (File Upload: Image/PDF/DOCX)                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND PROCESSING                          │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  File Type Detection                                  │   │
│  │  • Extension check                                    │   │
│  │  • MIME type verification                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│  ┌──────────────┬───────────────┬──────────────┐            │
│  │  Image Path  │   PDF Path    │  DOCX Path   │            │
│  │              │               │              │            │
│  │ Base64       │ pdf-parse     │  mammoth     │            │
│  │ Encoding     │ Extract Text  │  Extract Text│            │
│  └──────────────┴───────────────┴──────────────┘            │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Prepare AI Request                                   │   │
│  │  • Build enhanced prompt                              │   │
│  │  • Format input data                                  │   │
│  │  • Set model parameters                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    OPENAI API CALL                           │
│                                                               │
│  Request Structure:                                          │
│  {                                                            │
│    model: "gpt-4o",                                          │
│    messages: [                                               │
│      { role: "system", content: "System prompt..." },       │
│      { role: "user", content: [                             │
│          { type: "text", text: "Extraction rules..." },     │
│          { type: "image_url", image_url: {...} }            │
│        ]                                                      │
│      }                                                        │
│    ],                                                         │
│    max_tokens: 4000,                                         │
│    response_format: { type: "json_object" }                 │
│  }                                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  OPENAI RESPONSE                             │
│                                                               │
│  {                                                            │
│    choices: [{                                               │
│      message: {                                              │
│        content: "{...structured JSON...}"                   │
│      }                                                        │
│    }]                                                         │
│  }                                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  POST-PROCESSING                             │
│  • Parse JSON response                                       │
│  • Apply recurring blocks                                    │
│  • Split multi-subject blocks                                │
│  • Sort by time                                              │
│  • Validate data                                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
                  RETURN TO CLIENT
```

---

## Prompt Engineering Strategy

### 1. System Prompt (Role Definition)

```javascript
{
  role: "system",
  content: `You are an expert at extracting structured timetable data from images. 
  You must handle various real-world timetable formats including:
  - Typed, scanned, color-coded, or handwritten timetables
  - Vertical and horizontal text orientations
  - Complex layouts with merged cells
  - Recurring daily blocks
  - Top-row timing patterns that apply to all days
  
  Be extremely thorough and accurate in extracting ALL timing information.`
}
```

**Purpose**: Sets AI's role and expertise level

**Key Elements**:
- Establishes domain expertise
- Lists expected variations
- Emphasizes thoroughness
- Sets accuracy expectations

### 2. User Prompt (Task Instructions)

```javascript
{
  role: "user",
  content: [
    {
      type: "text",
      text: `Extract the complete timetable information from this image. Follow these critical rules:

**EXTRACTION RULES:**

1. **Fixed Daily Blocks**: Identify events that occur at the same time every day 
   (e.g., "Morning Work", "Lunch", "Registration"). Mark these as recurring by 
   including "isRecurring": true.

2. **Top-Row Timing Inheritance**: If timing is shown at the top of a column and 
   applies to all days below unless specified otherwise, apply that timing to all 
   applicable days. Look for header rows with times.

3. **Multiple Subjects in One Block**: If a single time slot contains multiple 
   subjects (e.g., "Math / Science"), split the time evenly among them OR preserve 
   them as a combined block with notes indicating it's multi-subject.

4. **Text Orientation**: Read both vertical and horizontal text. Rotate your 
   understanding to capture sideways labels.

5. **In-Block Timings**: Some blocks may have times written inside them. Prioritize 
   these over column/row headers when present.

6. **Time Format**: Always output times in 24-hour format (HH:MM), but recognize 
   12-hour formats with AM/PM.

**OUTPUT FORMAT:**
{
  "title": "Extracted timetable title or 'Weekly Timetable'",
  "metadata": {
    "hasTopRowTiming": true/false,
    "hasInBlockTiming": true/false,
    "hasRecurringBlocks": true/false,
    "orientation": "horizontal/vertical/mixed"
  },
  "days": [...],
  "recurringBlocks": [...]
}

**IMPORTANT:**
- Extract EVERY single block, even breaks and transitions
- If times are unclear, estimate based on visual spacing and typical school schedules
- Preserve original event names exactly as written
- Note any special formatting or colors used
- If a block spans multiple time slots, calculate the correct duration
- Look for patterns across days to identify recurring blocks`
    },
    {
      type: "image_url",
      image_url: {
        url: `data:image/jpeg;base64,${base64Image}`
      }
    }
  ]
}
```

**Purpose**: Detailed task instructions with edge case handling

**Key Components**:

1. **Extraction Rules**: Specific instructions for each scenario
2. **Output Format**: Structured schema definition
3. **Important Notes**: Critical reminders
4. **Examples**: Implicit through rule descriptions

---

## Prompt Optimization Techniques

### 1. Explicit Instructions

❌ **Vague**:
```
"Extract the timetable"
```

✅ **Explicit**:
```
"Extract EVERY single block, even breaks and transitions. 
Include start time, end time, and event name for each block."
```

### 2. Structured Output Format

```javascript
response_format: { type: "json_object" }
```

Forces JSON output, ensuring parseable responses.

### 3. Edge Case Handling

```
"If times are unclear, estimate based on visual spacing 
and typical school schedules"
```

Provides fallback behavior for ambiguous inputs.

### 4. Pattern Recognition

```
"Look for patterns across days to identify recurring blocks"
```

Encourages AI to use contextual reasoning.

### 5. Format Flexibility

```
"Always output times in 24-hour format (HH:MM), but recognize 
12-hour formats with AM/PM"
```

Handles various input formats, standardizes output.

---

## Parsing Strategy by File Type

### Image Files (.jpg, .png)

```javascript
async function extractFromImage(file) {
  // 1. Read image file
  const imageBuffer = fs.readFileSync(file.path);
  
  // 2. Convert to Base64
  const base64Image = imageBuffer.toString('base64');
  const mimeType = file.mimetype; // e.g., 'image/jpeg'
  
  // 3. Construct AI request
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`
            }
          }
        ]
      }
    ],
    max_tokens: 4000,
    response_format: { type: "json_object" }
  });
  
  // 4. Parse response
  const content = response.choices[0].message.content;
  return JSON.parse(content);
}
```

**Strategy**: Direct vision analysis
**Advantages**: Handles visual layout, colors, formatting
**Best For**: Scanned images, photos, color-coded timetables

### PDF Files (.pdf)

```javascript
async function extractFromPDF(file) {
  // 1. Read PDF file
  const dataBuffer = fs.readFileSync(file.path);
  
  // 2. Extract text using pdf-parse
  const pdfData = await pdfParse(dataBuffer);
  const textContent = pdfData.text;
  
  // 3. Construct AI request with extracted text
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Extract timetable information from this text:

${textContent}

[Extraction rules...]`
      }
    ],
    max_tokens: 4000,
    response_format: { type: "json_object" }
  });
  
  // 4. Parse response
  const content = response.choices[0].message.content;
  return JSON.parse(content);
}
```

**Strategy**: Text extraction then NLP analysis
**Advantages**: Fast, works with searchable PDFs
**Best For**: Typed PDFs, digital documents

### DOCX Files (.docx)

```javascript
async function extractFromDOCX(file) {
  // 1. Extract raw text using mammoth
  const result = await mammoth.extractRawText({ path: file.path });
  const textContent = result.value;
  
  // 2. Construct AI request with extracted text
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Extract timetable information from this Word document text:

${textContent}

[Extraction rules...]`
      }
    ],
    max_tokens: 4000,
    response_format: { type: "json_object" }
  });
  
  // 3. Parse response
  const content = response.choices[0].message.content;
  return JSON.parse(content);
}
```

**Strategy**: Text extraction then semantic analysis
**Advantages**: Preserves document structure
**Best For**: Word documents, templates

---

## Response Processing Pipeline

```javascript
async function extractTimetable(file) {
  // 1. Determine file type and extract
  let extractedData;
  const ext = path.extname(file.originalname).toLowerCase();
  
  switch (ext) {
    case '.jpg':
    case '.jpeg':
    case '.png':
      extractedData = await extractFromImage(file);
      break;
    case '.pdf':
      extractedData = await extractFromPDF(file);
      break;
    case '.docx':
      extractedData = await extractFromDOCX(file);
      break;
  }
  
  // 2. Post-process the AI response
  return postProcessTimetable(extractedData);
}

function postProcessTimetable(data) {
  // Step 1: Apply recurring blocks to all specified days
  if (data.recurringBlocks) {
    data.recurringBlocks.forEach(recurringBlock => {
      data.days.forEach(day => {
        if (recurringBlock.appliesTo.includes(day.day)) {
          // Add recurring block if not already present
          const exists = day.blocks.some(b => 
            b.event === recurringBlock.event && 
            b.startTime === recurringBlock.startTime
          );
          if (!exists) {
            day.blocks.push({
              ...recurringBlock,
              isRecurring: true
            });
          }
        }
      });
    });
  }
  
  // Step 2: Sort blocks by time
  data.days.forEach(day => {
    day.blocks.sort((a, b) => 
      parseTime(a.startTime) - parseTime(b.startTime)
    );
  });
  
  // Step 3: Handle multi-subject blocks
  data.days.forEach(day => {
    const newBlocks = [];
    day.blocks.forEach(block => {
      if (block.isMultiSubject && block.subjects.length > 1) {
        // Split evenly
        const duration = getMinutesDuration(block.startTime, block.endTime);
        const perSubject = Math.floor(duration / block.subjects.length);
        
        let currentTime = block.startTime;
        block.subjects.forEach((subject, idx) => {
          const start = currentTime;
          const end = addMinutesToTime(start, perSubject);
          newBlocks.push({
            event: subject,
            startTime: start,
            endTime: idx === block.subjects.length - 1 ? block.endTime : end,
            isSplit: true,
            notes: `Part of: ${block.event}`
          });
          currentTime = end;
        });
      } else {
        newBlocks.push(block);
      }
    });
    day.blocks = newBlocks;
  });
  
  return data;
}
```

---

## Prompt Variations by Scenario

### Scenario 1: Handwritten Timetable

**Enhanced Prompt Addition**:
```
"This timetable may be handwritten. Be flexible with character recognition. 
If text is ambiguous, use context from surrounding blocks to infer content."
```

### Scenario 2: Color-Coded Timetable

**Enhanced Prompt Addition**:
```
"Note the color of each block. Different colors may indicate different subjects, 
teachers, or importance levels. Include this in the 'color' field."
```

### Scenario 3: Vertical Text

**Enhanced Prompt Addition**:
```
"Some text may be rotated 90 degrees. Rotate your understanding to read sideways 
labels, especially day names or subject categories."
```

### Scenario 4: Multi-Page PDF

**Enhanced Prompt Addition**:
```
"This may be a multi-page document. Extract timetables from ALL pages and combine 
them appropriately. If pages represent different weeks or classes, note this in metadata."
```

---

## Error Handling

```javascript
try {
  const response = await openai.chat.completions.create({...});
  const content = response.choices[0].message.content;
  const data = JSON.parse(content);
  return data;
} catch (error) {
  if (error instanceof OpenAI.APIError) {
    // Handle OpenAI-specific errors
    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.status === 500) {
      throw new Error('OpenAI service error. Please try again.');
    }
  }
  throw error;
}
```

---

## Token Management

### Request Optimization

```javascript
// Compress base64 images for large files
if (imageBuffer.length > 5 * 1024 * 1024) {  // > 5MB
  imageBuffer = await compressImage(imageBuffer);
}

// Truncate very long text extractions
if (textContent.length > 10000) {
  textContent = textContent.substring(0, 10000) + 
    "\n...[truncated for length]";
}
```

### Response Limits

```javascript
max_tokens: 4000  // Enough for complex timetables
```

**Cost Estimation**:
- Input: ~500-1000 tokens (prompt + image)
- Output: ~1000-3000 tokens (structured data)
- Cost per request: ~$0.01-0.03

---

## Testing & Validation

### Prompt Testing Framework

```javascript
const testCases = [
  {
    name: "Simple weekly timetable",
    input: "simple-timetable.jpg",
    expectedFields: ["title", "days", "metadata"]
  },
  {
    name: "Complex multi-subject timetable",
    input: "complex-timetable.pdf",
    expectedBlocks: 50
  },
  {
    name: "Handwritten timetable",
    input: "handwritten.jpg",
    minAccuracy: 0.85
  }
];

// Run tests
testCases.forEach(async (test) => {
  const result = await extractTimetable(test.input);
  validateResult(result, test.expected);
});
```

---

## Performance Optimization

1. **Lazy Client Initialization**
```javascript
let openai = null;
function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}
```

2. **Image Compression**
```javascript
// Reduce image size without losing quality
const compressed = await sharp(buffer)
  .resize(2000, 2000, { fit: 'inside' })
  .jpeg({ quality: 90 })
  .toBuffer();
```

3. **Caching** (Future)
```javascript
// Cache frequently requested timetables
const cacheKey = crypto.createHash('md5').update(fileBuffer).digest('hex');
if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}
```

---

## AI Integration Best Practices

✅ **DO**:
- Use structured JSON output
- Provide comprehensive prompts
- Handle errors gracefully
- Validate AI responses
- Monitor API usage
- Set reasonable timeouts
- Test with edge cases

❌ **DON'T**:
- Expose API keys
- Trust AI output blindly
- Ignore rate limits
- Skip error handling
- Use outdated models
- Exceed token limits
- Ignore cost monitoring

---

**This AI integration provides robust, accurate timetable extraction across all formats!** 🚀

