import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import TimetableDisplay from './components/TimetableDisplay';
import './App.css';

function App() {
  const [timetableData, setTimetableData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUploadSuccess = (data) => {
    setTimetableData(data);
    setError(null);
  };

  const handleUploadError = (errorMessage) => {
    setError(errorMessage);
    setTimetableData(null);
  };

  const handleReset = () => {
    setTimetableData(null);
    setError(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <h1 className="app-title">
              📅 Timetable OCR
            </h1>
            <p className="app-subtitle">
              Extract and visualize your weekly schedule from any format
            </p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {!timetableData && !error && (
            <div className="upload-section fade-in">
              <FileUpload
                onSuccess={handleUploadSuccess}
                onError={handleUploadError}
                onLoadingChange={setIsLoading}
              />
            </div>
          )}

          {error && (
            <div className="error-section fade-in">
              <div className="error-card">
                <div className="error-icon">⚠️</div>
                <h3>Error Processing Timetable</h3>
                <p>{error}</p>
                <button onClick={handleReset} className="btn btn-primary">
                  Try Again
                </button>
              </div>
            </div>
          )}

          {timetableData && (
            <div className="timetable-section fade-in">
              <div className="section-header">
                <h2>Extracted Timetable</h2>
                <button onClick={handleReset} className="btn btn-secondary">
                  Upload New Timetable
                </button>
              </div>
              <TimetableDisplay data={timetableData} />
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>© 2025 Timetable OCR. Powered by OpenAI GPT-4 Vision.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

