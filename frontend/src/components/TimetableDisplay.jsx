import React, { useState, useMemo } from 'react';
import './TimetableDisplay.css';

const TimetableDisplay = ({ data }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  if (!data || !data.days || data.days.length === 0) {
    return (
      <div className="no-data">
        <p>No timetable data available</p>
      </div>
    );
  }

  // Parse time to minutes from midnight
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    try {
      const cleanTime = timeStr.trim().replace(/\s+/g, '');
      let hours = 0, minutes = 0;
      
      // Handle formats like "09:00", "9:00 AM", "09:00:00"
      const timeMatch = cleanTime.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        hours = parseInt(timeMatch[1]);
        minutes = parseInt(timeMatch[2]);
        
        // Handle AM/PM
        if (cleanTime.toLowerCase().includes('pm') && hours < 12) {
          hours += 12;
        } else if (cleanTime.toLowerCase().includes('am') && hours === 12) {
          hours = 0;
        }
      }
      
      return hours * 60 + minutes;
    } catch (e) {
      return 0;
    }
  };

  // Find the earliest and latest times across all blocks
  const { startMinutes, endMinutes, timeSlots } = useMemo(() => {
    let min = Infinity;
    let max = 0;

    data.days.forEach(day => {
      day.blocks.forEach(block => {
        const start = timeToMinutes(block.startTime);
        const end = timeToMinutes(block.endTime);
        if (start > 0) min = Math.min(min, start);
        if (end > 0) max = Math.max(max, end);
      });
    });

    // Default to 8 AM - 4 PM if no times found
    if (min === Infinity) min = 8 * 60; // 8:00 AM
    if (max === 0) max = 16 * 60; // 4:00 PM

    // Round to nearest hour
    min = Math.floor(min / 60) * 60;
    max = Math.ceil(max / 60) * 60;

    // Generate time slots (every 30 minutes)
    const slots = [];
    for (let i = min; i <= max; i += 30) {
      const hours = Math.floor(i / 60);
      const mins = i % 60;
      const ampm = hours >= 12 ? 'pm' : 'am';
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      slots.push({
        minutes: i,
        label: `${displayHours}:${mins.toString().padStart(2, '0')}`,
        ampm: ampm
      });
    }

    return { startMinutes: min, endMinutes: max, timeSlots: slots };
  }, [data]);

  const getSubjectColor = (eventName, blockData) => {
    // Special styling for recurring blocks
    if (blockData?.isRecurring) {
      return '#94a3b8'; // gray for recurring events
    }
    
    // Special styling for split/multi-subject blocks
    if (blockData?.isSplit) {
      return '#a78bfa'; // purple for split blocks
    }
    
    const name = eventName.toLowerCase();
    
    // Color mapping based on subject type
    if (name.includes('math') || name.includes('numeracy')) return '#06b6d4'; // cyan
    if (name.includes('english') || name.includes('writing') || name.includes('literacy')) return '#10b981'; // green
    if (name.includes('science')) return '#8b5cf6'; // purple
    if (name.includes('pe') || name.includes('physical') || name.includes('play')) return '#a3e635'; // lime
    if (name.includes('music')) return '#fbbf24'; // yellow
    if (name.includes('art') || name.includes('craft')) return '#f97316'; // orange
    if (name.includes('lunch') || name.includes('break') || name.includes('snack')) return '#94a3b8'; // gray
    if (name.includes('assembly') || name.includes('registration')) return '#f97316'; // orange
    if (name.includes('french') || name.includes('language')) return '#ef4444'; // red
    if (name.includes('rwi') || name.includes('reading')) return '#10b981'; // green
    if (name.includes('mix-up') || name.includes('buddy')) return '#f97316'; // orange
    if (name.includes('hub')) return '#a3e635'; // lime
    
    // Default colors
    const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const hash = eventName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const calculatePosition = (startTime, endTime) => {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    
    const totalMinutes = endMinutes - startMinutes;
    const left = ((start - startMinutes) / totalMinutes) * 100;
    const width = ((end - start) / totalMinutes) * 100;
    
    return { left: `${left}%`, width: `${width}%` };
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time;
  };

  const calculateDuration = (startTime, endTime) => {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    const diff = end - start;
    
    if (diff < 60) {
      return `${diff}min`;
    } else {
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    }
  };

  return (
    <div className="timetable-display">
      {/* Timetable Title */}
      <div className="timetable-header">
        <div className="header-left">
          <h2 className="timetable-title">
            {data.title || 'Weekly Timetable'}
          </h2>
          <div className="timetable-stats">
            <span className="stat-badge">
              📅 {data.days.length} {data.days.length === 1 ? 'Day' : 'Days'}
            </span>
            <span className="stat-badge">
              📚 {data.days.reduce((sum, day) => sum + day.blocks.length, 0)} Classes
            </span>
          </div>
        </div>
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            📊 Grid View
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 List View
          </button>
        </div>
      </div>

      {/* Calendar-Style Grid View */}
      {viewMode === 'grid' && (
        <div className="calendar-view">
          {/* Time header */}
          <div className="time-header">
            <div className="day-label-cell">Day</div>
            <div className="time-slots">
              {timeSlots.map((slot, idx) => (
                <div key={idx} className="time-slot">
                  <span className="time-label">{slot.label}</span>
                  <span className="time-period">{slot.ampm}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Days rows */}
          <div className="calendar-grid">
            {data.days.map((day, dayIndex) => (
              <div key={dayIndex} className="calendar-row">
                <div className="day-label">
                  <span className="day-number">{String(dayIndex + 1).padStart(2, '0')}</span>
                  <span className="day-name">{day.day}</span>
                </div>
                <div className="day-timeline">
                  {/* Background grid */}
                  <div className="timeline-grid">
                    {timeSlots.map((slot, idx) => (
                      <div key={idx} className="grid-cell"></div>
                    ))}
                  </div>
                  
                  {/* Event blocks */}
                  <div className="event-blocks">
                    {day.blocks.map((block, blockIndex) => {
                      const position = calculatePosition(block.startTime, block.endTime);
                      const color = getSubjectColor(block.event, block);
                      
                      return (
                        <div
                          key={blockIndex}
                          className={`event-block ${block.isRecurring ? 'recurring' : ''} ${block.isSplit ? 'split' : ''}`}
                          style={{
                            left: position.left,
                            width: position.width,
                            backgroundColor: color,
                          }}
                          title={`${block.event}\n${block.startTime} - ${block.endTime}${block.notes ? '\n' + block.notes : ''}${block.isRecurring ? '\n🔄 Recurring Daily' : ''}${block.isSplit ? '\n✂️ Split Subject' : ''}`}
                        >
                          <div className="event-content">
                            {block.isRecurring && <span className="recurring-badge">🔄</span>}
                            {block.isSplit && <span className="split-badge">✂️</span>}
                            <div className="event-name">{block.event}</div>
                            <div className="event-duration">
                              {block.duration || calculateDuration(block.startTime, block.endTime)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View (Original Desktop Grid) */}
      {viewMode === 'list' && (
        <div className="timetable-grid desktop-only">
          {data.days.map((day, dayIndex) => (
            <div key={dayIndex} className="day-column">
              <div className="day-header">
                <h3>{day.day}</h3>
                <span className="block-count">{day.blocks.length} blocks</span>
              </div>
              <div className="blocks-container">
                {day.blocks.length > 0 ? (
                  day.blocks.map((block, blockIndex) => (
                    <div
                      key={blockIndex}
                      className={`time-block ${block.isRecurring ? 'recurring' : ''} ${block.isSplit ? 'split' : ''}`}
                      style={{ borderLeftColor: getSubjectColor(block.event, block) }}
                    >
                      <div className="block-header">
                        <div className="block-time">
                          {block.startTime && block.endTime ? (
                            <>
                              <span className="time">{formatTime(block.startTime)}</span>
                              <span className="time-separator">-</span>
                              <span className="time">{formatTime(block.endTime)}</span>
                            </>
                          ) : (
                            <span className="time">{block.duration || 'N/A'}</span>
                          )}
                        </div>
                        {block.isRecurring && <span className="badge recurring-badge">🔄 Daily</span>}
                        {block.isSplit && <span className="badge split-badge">✂️ Split</span>}
                      </div>
                      <div className="block-event">
                        {block.event}
                      </div>
                      {block.startTime && block.endTime && (
                        <div className="block-duration">
                          {calculateDuration(block.startTime, block.endTime)}
                        </div>
                      )}
                      {block.notes && (
                        <div className="block-notes">
                          📝 {block.notes}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="no-blocks">No classes scheduled</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile View - Accordion Layout */}
      <div className="timetable-accordion mobile-only">
        {data.days.map((day, dayIndex) => (
          <div key={dayIndex} className="accordion-item">
            <button
              className={`accordion-header ${selectedDay === dayIndex ? 'active' : ''}`}
              onClick={() => setSelectedDay(selectedDay === dayIndex ? null : dayIndex)}
            >
              <div className="accordion-header-content">
                <h3>{day.day}</h3>
                <span className="block-count">{day.blocks.length} blocks</span>
              </div>
              <span className="accordion-icon">
                {selectedDay === dayIndex ? '▼' : '▶'}
              </span>
            </button>
            {selectedDay === dayIndex && (
              <div className="accordion-content">
                {day.blocks.length > 0 ? (
                  day.blocks.map((block, blockIndex) => (
                    <div
                      key={blockIndex}
                      className="time-block"
                      style={{ borderLeftColor: getSubjectColor(block.event) }}
                    >
                      <div className="block-time">
                        {block.startTime && block.endTime ? (
                          <>
                            <span className="time">{formatTime(block.startTime)}</span>
                            <span className="time-separator">-</span>
                            <span className="time">{formatTime(block.endTime)}</span>
                          </>
                        ) : (
                          <span className="time">{block.duration || 'N/A'}</span>
                        )}
                      </div>
                      <div className="block-event">
                        {block.event}
                      </div>
                      {block.startTime && block.endTime && (
                        <div className="block-duration">
                          {calculateDuration(block.startTime, block.endTime)}
                        </div>
                      )}
                      {block.notes && (
                        <div className="block-notes">
                          📝 {block.notes}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="no-blocks">No classes scheduled</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetableDisplay;

