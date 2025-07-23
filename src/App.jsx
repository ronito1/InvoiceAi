import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

// --- Configuration ---
// IMPORTANT: You need a Google AI API Key to run this locally.
// 1. Get a free key from Google AI Studio: https://aistudio.google.com/app/apikey
// 2. Paste your key here:
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// --- CSS ---
const manualCSS = `
  :root {
    --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    --font-mono: 'Courier New', Courier, monospace;
    --bg-color: #000000;
    --text-color: #eaeaea;
    --primary-color: #ffffff;
    --secondary-color: #a0a0a0;
    --border-color: #333333;
    --card-bg: #1a1a1a;
    --hover-bg: #2a2a2a;
  }
  body { margin: 0; background-color: var(--bg-color); color: var(--text-color); font-family: var(--font-sans); -webkit-font-smoothing: antialiased; }
  .app-container { max-width: 1152px; margin: 0 auto; padding: 2rem 1rem; }
  .app-header { text-align: center; margin-bottom: 3rem; }
  .app-header h1 { font-family: var(--font-mono); font-size: 2.5rem; font-weight: 700; letter-spacing: -0.05em; color: var(--primary-color); margin: 0; }
  .app-header p { color: var(--secondary-color); font-size: 1.125rem; margin-top: 0.5rem; max-width: 42rem; margin-left: auto; margin-right: auto; }
  .dropzone { max-width: 36rem; margin: 0 auto; border: 2px dashed var(--border-color); border-radius: 0.75rem; cursor: pointer; transition: border-color 0.2s, background-color 0.2s; }
  .dropzone:hover { border-color: var(--secondary-color); }
  .dropzone-active { border-color: var(--primary-color); background-color: var(--card-bg); }
  .dropzone-content { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; text-align: center; }
  .dropzone-content svg { width: 3rem; height: 3rem; color: var(--secondary-color); }
  .dropzone-content p { margin-top: 1rem; font-weight: 600; color: var(--primary-color); }
  .dropzone-content span { margin-top: 0.25rem; font-size: 0.75rem; color: var(--secondary-color); }
  .main-content { display: grid; gap: 2rem; }
  @media (min-width: 1024px) { .main-content { grid-template-columns: 2fr 3fr; } }
  .card { background-color: var(--card-bg); padding: 1.5rem; border-radius: 0.75rem; border: 1px solid var(--border-color); }
  .card h2 { font-family: var(--font-mono); font-size: 1.25rem; font-weight: 700; margin-top: 0; margin-bottom: 1rem; color: var(--primary-color); }
  .preview-image-wrapper { width: 100%; border-radius: 0.5rem; overflow: hidden; border: 1px solid var(--border-color); background-color: var(--bg-color); }
  .preview-image-wrapper img { display: block; width: 100%; height: auto; object-fit: contain; }
  .controls { margin-top: 1.5rem; display: flex; gap: 1rem; }
  .btn { flex-grow: 1; font-weight: 700; padding: 0.75rem 1.5rem; border-radius: 0.5rem; border: none; cursor: pointer; transition: background-color 0.2s; display: flex; align-items: center; justify-content: center; }
  .btn-primary { background-color: var(--primary-color); color: var(--bg-color); }
  .btn-primary:hover { background-color: #cccccc; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-secondary { background-color: var(--hover-bg); color: var(--primary-color); }
  .btn-secondary:hover { background-color: var(--border-color); }
  .error-message { margin-top: 1rem; background-color: rgba(255, 77, 77, 0.1); border: 1px solid rgba(255, 77, 77, 0.5); color: #ffc2c2; padding: 1rem; border-radius: 0.5rem; font-size: 0.875rem; }
  .results-placeholder, .results-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px; color: var(--secondary-color); }
  .results-loader p { margin-top: 1rem; }
  .data-section { margin-bottom: 1.5rem; }
  .data-section h3 { font-family: var(--font-mono); font-size: 1rem; color: var(--primary-color); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem; }
  .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
  .info-item p { margin: 0; }
  .info-item strong { color: var(--secondary-color); font-weight: normal; }
  .items-table-wrapper { overflow-x: auto; }
  .items-table { width: 100%; border-collapse: collapse; }
  .items-table th, .items-table td { padding: 0.75rem; text-align: left; font-family: var(--font-mono); font-size: 0.875rem; border-bottom: 1px solid var(--border-color); white-space: nowrap; }
  .items-table th { color: var(--secondary-color); font-weight: normal; text-transform: uppercase; }
  .items-table tr:last-child td { border-bottom: none; }
  .app-footer { text-align: center; margin-top: 4rem; color: #666; font-size: 0.875rem; }
`;

// Helper function to convert a file to a base64 string
const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

const IconUpload = () => ( <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg> );
const Spinner = () => ( <div style={{width: '2rem', height: '2rem', borderRadius: '50%', border: '2px solid #333', borderTopColor: '#fff', animation: 'spin 1s linear infinite'}}></div> );


// --- NEW: Fully Dynamic Renderer Component ---
const DynamicRenderer = ({ response }) => {
    const { invoiceInfo, lineItems } = response;

    if (!invoiceInfo || !lineItems) {
        return <p>Could not process invoice data into a standard format.</p>;
    }

    return (
        <div>
            <div className="data-section">
                <h3>Invoice Information</h3>
                <div className="info-grid">
                    {Object.entries(invoiceInfo).map(([key, value]) => (
                        <div key={key} className="info-item">
                            <p><strong>{key.replace(/_/g, ' ')}:</strong> {value}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="data-section">
                <h3>Line Items</h3>
                {lineItems.headers && lineItems.rows && lineItems.rows.length > 0 ? (
                    <div className="items-table-wrapper">
                        <table className="items-table">
                            <thead>
                                <tr>
                                    {lineItems.headers.map((header, index) => (
                                        <th key={index}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {lineItems.rows.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex}>{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p>No line items found.</p>}
            </div>
        </div>
    );
};


// --- Main App Component ---
export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setExtractedData(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/jpeg': [], 'image/png': [] }, multiple: false });

  const handleProcessInvoice = async () => {
    if (!file) { setError("Please upload a file first."); return; }
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GOOGLE_AI_API_KEY") { setError("Please add your Google AI API Key."); return; }
    setLoading(true);
    setError(null);
    setExtractedData(null);
    try {
      const base64ImageData = await fileToBase64(file);
      const payload = {
        contents: [
          {
            parts: [
              { text: `
                Analyze this invoice image and perform the following steps:
                1.  Extract top-level information like Invoice Number, Date, Vendor/Company Name, and any final Total amounts. Put this into a JSON object called "invoiceInfo".
                2.  Identify the main table of line items.
                3.  Extract the exact column headers of this table into a JSON array called "headers".
                4.  Extract each row of data from the table into a JSON array of arrays called "rows". Each inner array should correspond to a row, with values in the same order as the headers.
                
                Finally, respond with a single JSON object containing two top-level keys: "invoiceInfo" and "lineItems" (which contains the "headers" and "rows").
                IMPORTANT: Your entire response must be ONLY the JSON object itself. Do not include conversational text or markdown.
              `},
              { inline_data: { mime_type: file.type, data: base64ImageData } }
            ]
          }
        ]
      };
      const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`API Error (${response.status}): ${errorBody.error?.message || 'Unknown error'}`);
      }
      const result = await response.json();
      if (result.candidates && result.candidates.length > 0) {
        let content = result.candidates[0].content.parts[0].text;
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            content = jsonMatch[0];
        }

        try {
            const parsedJson = JSON.parse(content);
            setExtractedData(parsedJson);
        } catch (e) {
            console.error("Failed to parse JSON from LLM response:", content);
            throw new Error("The AI returned a response that was not valid JSON.");
        }

      } else {
        throw new Error("The API returned no valid candidates.");
      }
    } catch (err) {
      setError(err.message || "An unknown error occurred.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setExtractedData(null);
    setError(null);
    setLoading(false);
  };

  return (
    <>
      <style>{manualCSS}</style>
      <div className="app-container">
        <header className="app-header">
          <h1>InvoiceAI</h1>
          <p>Upload an invoice image to extract data automatically using Google Gemini.</p>
        </header>
        <main>
          {!preview ? (
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}>
              <div className="dropzone-content">
                <IconUpload />
                <input {...getInputProps()} />
                <p>{isDragActive ? "Drop the file here..." : "Drag & drop an invoice image, or click to select"}</p>
                <span>PNG or JPG only</span>
              </div>
            </div>
          ) : (
            <div className="main-content">
              <div className="preview-column">
                <div className="card">
                  <h2>Invoice Preview</h2>
                  <div className="preview-image-wrapper"><img src={preview} alt="Invoice preview" /></div>
                </div>
                <div className="controls">
                  <button onClick={handleProcessInvoice} disabled={loading} className="btn btn-primary">{loading ? <Spinner /> : 'Analyze Invoice'}</button>
                  <button onClick={handleReset} className="btn btn-secondary">Reset</button>
                </div>
                {error && <div className="error-message">{error}</div>}
              </div>
              <div className="card">
                <h2>Extracted Data</h2>
                {loading && ( <div className="results-loader"><Spinner /><p>Analyzing with Gemini...</p></div> )}
                
                {/* --- Use the new DynamicRenderer --- */}
                {extractedData && <DynamicRenderer response={extractedData} />}

                {!loading && !extractedData && ( <div className="results-placeholder"><p>Analysis results will appear here.</p></div> )}
              </div>
            </div>
          )}
        </main>
        <footer className="app-footer"><p>Powered by React & Google Gemini.</p></footer>
      </div>
    </>
  );
}
