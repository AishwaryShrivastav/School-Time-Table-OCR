import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Initialize OpenAI client lazily to ensure env vars are loaded
let openai = null;
function getOpenAIClient() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
}

/**
 * Safely parse JSON response from OpenAI
 */
function safeJSONParse(content) {
  try {
    // First, try direct parsing
    return JSON.parse(content);
  } catch (error) {
    console.error('Initial JSON parse failed:', error.message);
    
    try {
      // Try to clean up the content
      let cleaned = content.trim();
      
      // Remove any markdown code blocks if present
      cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Try parsing again
      return JSON.parse(cleaned);
    } catch (secondError) {
      console.error('Cleaned JSON parse also failed:', secondError.message);
      console.error('Problematic content (first 500 chars):', content.substring(0, 500));
      console.error('Problematic content (last 500 chars):', content.substring(Math.max(0, content.length - 500)));
      
      throw new Error(`Failed to parse JSON response: ${secondError.message}`);
    }
  }
}

/**
 * Extract timetable data from various file formats
 */
export async function extractTimetable(file) {
  const fileExtension = path.extname(file.originalname).toLowerCase();

  let extractedData;

  try {
    switch (fileExtension) {
      case '.jpg':
      case '.jpeg':
      case '.png':
        extractedData = await extractFromImage(file);
        break;
      case '.pdf':
        extractedData = await extractFromPDF(file);
        break;
      case '.docx':
      case '.doc':
        extractedData = await extractFromDOCX(file);
        break;
      default:
        throw new Error('Unsupported file format');
    }

    // Post-process to apply recurring blocks and handle inheritance
    return postProcessTimetable(extractedData);
  } catch (error) {
    console.error('Extraction error:', error);
    throw error;
  }
}

/**
 * Post-process timetable data to handle recurring blocks and timing inheritance
 */
function postProcessTimetable(data) {
  if (!data || !data.days) return data;

  // If there are recurring blocks, apply them to all specified days
  if (data.recurringBlocks && data.recurringBlocks.length > 0) {
    data.recurringBlocks.forEach(recurringBlock => {
      const appliesTo = recurringBlock.appliesTo || [];
      
      data.days.forEach(day => {
        if (appliesTo.includes(day.day) || appliesTo.includes('all')) {
          // Check if this block already exists for this day
          const exists = day.blocks.some(block => 
            block.event === recurringBlock.event && 
            block.startTime === recurringBlock.startTime
          );

          if (!exists) {
            day.blocks.push({
              event: recurringBlock.event,
              startTime: recurringBlock.startTime,
              endTime: recurringBlock.endTime,
              duration: recurringBlock.duration || calculateDurationFromTimes(recurringBlock.startTime, recurringBlock.endTime),
              isRecurring: true,
              notes: recurringBlock.notes || 'Daily recurring event'
            });
          }
        }
      });
    });
  }

  // Sort blocks by start time for each day
  data.days.forEach(day => {
    if (day.blocks && day.blocks.length > 0) {
      day.blocks.sort((a, b) => {
        const timeA = parseTime(a.startTime);
        const timeB = parseTime(b.startTime);
        return timeA - timeB;
      });
    }
  });

  // Handle multi-subject blocks if needed
  data.days.forEach(day => {
    const newBlocks = [];
    day.blocks.forEach(block => {
      if (block.isMultiSubject && block.subjects && block.subjects.length > 1) {
        // Split time evenly among subjects
        const totalMinutes = getMinutesDuration(block.startTime, block.endTime);
        const minutesPerSubject = Math.floor(totalMinutes / block.subjects.length);
        
        let currentStart = block.startTime;
        block.subjects.forEach((subject, index) => {
          const start = currentStart;
          const end = addMinutesToTime(start, minutesPerSubject);
          
          newBlocks.push({
            event: subject,
            startTime: start,
            endTime: index === block.subjects.length - 1 ? block.endTime : end,
            duration: `${minutesPerSubject} min`,
            notes: `Part of: ${block.event}`,
            isSplit: true
          });
          
          currentStart = end;
        });
      } else {
        newBlocks.push(block);
      }
    });
    day.blocks = newBlocks;
  });

  return data;
}

/**
 * Parse time string to minutes from midnight
 */
function parseTime(timeStr) {
  if (!timeStr) return 0;
  try {
    const parts = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (parts) {
      return parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }
  } catch (e) {
    return 0;
  }
  return 0;
}

/**
 * Get duration in minutes between two times
 */
function getMinutesDuration(startTime, endTime) {
  return parseTime(endTime) - parseTime(startTime);
}

/**
 * Add minutes to a time string
 */
function addMinutesToTime(timeStr, minutes) {
  const totalMinutes = parseTime(timeStr) + minutes;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Calculate duration from start and end times
 */
function calculateDurationFromTimes(startTime, endTime) {
  const minutes = getMinutesDuration(startTime, endTime);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}min` : `${hours}h`;
}

/**
 * Extract timetable from image using OpenAI Vision API
 */
async function extractFromImage(file) {
  const imageBuffer = fs.readFileSync(file.path);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = file.mimetype;

  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o",
    messages: [
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
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Extract the complete timetable information from this image and return it as a valid JSON object. Follow these critical rules:

**EXTRACTION RULES:**

1. **Fixed Daily Blocks**: Identify events that occur at the same time every day (e.g., "Morning Work", "Lunch", "Registration"). Mark these as recurring by including "isRecurring": true.

2. **Top-Row Timing Inheritance**: If timing is shown at the top of a column and applies to all days below unless specified otherwise, apply that timing to all applicable days. Look for header rows with times.

3. **Multiple Subjects in One Block**: If a single time slot contains multiple subjects (e.g., "Math / Science"), split the time evenly among them OR preserve them as a combined block with notes indicating it's multi-subject.

4. **Text Orientation**: Read both vertical and horizontal text. Rotate your understanding to capture sideways labels.

5. **In-Block Timings**: Some blocks may have times written inside them. Prioritize these over column/row headers when present.

6. **Time Format**: Always output times in 24-hour format (HH:MM), but recognize 12-hour formats with AM/PM.

**OUTPUT FORMAT:**
{
  "title": "Extracted timetable title or 'Weekly Timetable'",
  "metadata": {
    "hasTopRowTiming": true/false,
    "hasInBlockTiming": true/false,
    "hasRecurringBlocks": true/false,
    "orientation": "horizontal/vertical/mixed"
  },
  "days": [
    {
      "day": "Monday",
      "blocks": [
        {
          "event": "Mathematics",
          "startTime": "09:00",
          "endTime": "10:00",
          "duration": "1 hour",
          "isRecurring": false,
          "isMultiSubject": false,
          "subjects": ["Mathematics"],
          "notes": "Any additional details, room numbers, teacher names",
          "color": "if color-coded, note the color"
        }
      ]
    }
  ],
  "recurringBlocks": [
    {
      "event": "Lunch Break",
      "startTime": "12:00",
      "endTime": "13:00",
      "appliesTo": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    }
  ]
}

**IMPORTANT:**
- Extract EVERY single block, even breaks and transitions
- If times are unclear, estimate based on visual spacing and typical school schedules
- Preserve original event names exactly as written
- Note any special formatting or colors used
- If a block spans multiple time slots, calculate the correct duration
- Look for patterns across days to identify recurring blocks

**JSON FORMATTING RULES:**
- Return ONLY valid JSON, no markdown code blocks
- Escape all special characters in strings (quotes, newlines, backslashes)
- Use double quotes for all property names and string values
- Ensure all strings are properly terminated
- Do not include any text outside the JSON object`
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`
            }
          }
        ]
      }
    ],
    max_tokens: 8000,
    temperature: 0.1,
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content;
  return safeJSONParse(content);
}

/**
 * Extract timetable from PDF
 */
async function extractFromPDF(file) {
  const dataBuffer = fs.readFileSync(file.path);
  const pdfData = await pdfParse(dataBuffer);
  const textContent = pdfData.text;

  // Use OpenAI to parse the extracted text
  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert at extracting structured timetable data from text. 
        You must identify patterns, recurring blocks, and timing inheritance.
        Handle complex timetable structures with multiple subjects per block.`
      },
      {
        role: "user",
        content: `Extract comprehensive timetable information from this text and return it as a valid JSON object:

${textContent}

**FOLLOW THESE RULES:**
1. Identify recurring daily blocks (e.g., lunch, breaks that happen same time every day)
2. Detect top-row timing patterns that apply to multiple days
3. Split multi-subject blocks if multiple subjects share one time slot
4. Extract all timing information, including in-block times if present
5. Preserve all notes, room numbers, and additional details

**OUTPUT FORMAT:**
{
  "title": "Extracted timetable title",
  "metadata": {
    "hasTopRowTiming": true/false,
    "hasRecurringBlocks": true/false
  },
  "days": [
    {
      "day": "Monday",
      "blocks": [
        {
          "event": "Mathematics",
          "startTime": "09:00",
          "endTime": "10:00",
          "duration": "1 hour",
          "isRecurring": false,
          "isMultiSubject": false,
          "subjects": ["Mathematics"],
          "notes": "Room 101, Mr. Smith"
        }
      ]
    }
  ],
  "recurringBlocks": [
    {
      "event": "Lunch",
      "startTime": "12:00",
      "endTime": "13:00",
      "appliesTo": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    }
  ]
}

Extract EVERY block accurately with all timing details.

**JSON FORMATTING RULES:**
- Return ONLY valid JSON, no markdown code blocks
- Escape all special characters in strings (quotes, newlines, backslashes)
- Use double quotes for all property names and string values
- Ensure all strings are properly terminated
- Do not include any text outside the JSON object`
      }
    ],
    max_tokens: 8000,
    temperature: 0.1,
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content;
  return safeJSONParse(content);
}

/**
 * Extract timetable from DOCX
 */
async function extractFromDOCX(file) {
  const result = await mammoth.extractRawText({ path: file.path });
  const textContent = result.value;

  // Use OpenAI to parse the extracted text
  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert at extracting structured timetable data from text. 
        You must identify patterns, recurring blocks, and timing inheritance.
        Handle complex timetable structures intelligently.`
      },
      {
        role: "user",
        content: `Extract comprehensive timetable information from this Word document text and return it as a valid JSON object:

${textContent}

**CRITICAL RULES:**
1. **Recurring Blocks**: Identify events at same time every day (mark isRecurring: true)
2. **Timing Inheritance**: If timing is at top and applies to all days, propagate it
3. **Multi-Subject Blocks**: Split or preserve blocks with multiple subjects
4. **Complete Extraction**: Get every single event, break, and transition
5. **Preserve Details**: Keep all notes, teachers, rooms, special instructions

**OUTPUT FORMAT:**
{
  "title": "Extracted timetable title",
  "metadata": {
    "hasTopRowTiming": true/false,
    "hasRecurringBlocks": true/false,
    "documentType": "word"
  },
  "days": [
    {
      "day": "Monday",
      "blocks": [
        {
          "event": "Mathematics",
          "startTime": "09:00",
          "endTime": "10:00",
          "duration": "1 hour",
          "isRecurring": false,
          "isMultiSubject": false,
          "subjects": ["Mathematics"],
          "notes": "Additional details",
          "teacher": "if mentioned",
          "room": "if mentioned"
        }
      ]
    }
  ],
  "recurringBlocks": [
    {
      "event": "Daily event",
      "startTime": "12:00",
      "endTime": "13:00",
      "appliesTo": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    }
  ]
}

Be thorough - extract EVERYTHING with accurate timing.

**JSON FORMATTING RULES:**
- Return ONLY valid JSON, no markdown code blocks
- Escape all special characters in strings (quotes, newlines, backslashes)
- Use double quotes for all property names and string values
- Ensure all strings are properly terminated
- Do not include any text outside the JSON object`
      }
    ],
    max_tokens: 8000,
    temperature: 0.1,
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content;
  return safeJSONParse(content);
}

