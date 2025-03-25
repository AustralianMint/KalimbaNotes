import React, { useState, useEffect } from 'react';
import './App.css';
import { jsPDF } from 'jspdf';

function App() {
  // Default color scheme
  const defaultColors = {
    '1': '#FF5252', // red
    '1\'': '#4285F4', // blue
    '1\'\'': '#FFEB3B', // yellow
    '2': '#FF9800', // orange
    '2\'': '#2196F3', // lighter blue
    '2\'\'': '#FFC107', // amber
    '3': '#4CAF50', // green
    '3\'': '#673AB7', // deep purple
    '3\'\'': '#00BCD4', // cyan
    '4': '#9C27B0', // purple
    '4\'': '#009688', // teal
    '4\'\'': '#8BC34A', // light green
    '5': '#E91E63', // pink
    '5\'': '#3F51B5', // indigo
    '5\'\'': '#CDDC39', // lime
    '6': '#795548', // brown
    '6\'': '#607D8B', // blue grey
    '6\'\'': '#FF5722', // deep orange
    '7': '#9E9E9E', // grey
    '7\'': '#F44336', // red
    '7\'\'': '#03A9F4', // light blue
  };

  // State for notes and color settings
  const [notes, setNotes] = useState('');
  const [colorSettings, setColorSettings] = useState(defaultColors);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState('1');
  const [selectedColor, setSelectedColor] = useState(defaultColors['1']);

  // Load from localStorage on initial render
  useEffect(() => {
    const savedNotes = localStorage.getItem('kalimbaNotes');
    const savedColors = localStorage.getItem('kalimbaColors');
    
    if (savedNotes) {
      setNotes(savedNotes);
    }
    
    if (savedColors) {
      setColorSettings(JSON.parse(savedColors));
    }
  }, []);

  // Save to localStorage whenever notes or colors change
  useEffect(() => {
    localStorage.setItem('kalimbaNotes', notes);
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('kalimbaColors', JSON.stringify(colorSettings));
  }, [colorSettings]);

  // Handle note input
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  // Update color for a specific note
  const updateColorSetting = () => {
    setColorSettings(prev => ({
      ...prev,
      [selectedNote]: selectedColor
    }));
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add a title
    doc.setFontSize(16);
    doc.text('Kalimba Notes', 20, 20);
    
    // Split the colored notes into plain text
    const plainTextNotes = notes;
    
    // Add the notes
    doc.setFontSize(12);
    
    // Split by newlines and add each line
    const lines = plainTextNotes.split('\n');
    let y = 30;
    
    lines.forEach(line => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 7;
    });
    
    doc.save('kalimba-notes.pdf');
  };

  // Reset to default colors
  const resetToDefaultColors = () => {
    setColorSettings(defaultColors);
  };

  // Render colored text
  const renderColoredText = () => {
    if (!notes) return null;
    
    // Regular expression to match note patterns (digit followed by optional primes)
    const noteRegex = /(\d[']*)/g;
    
    // Split the text by the regex to get segments
    const segments = notes.split(noteRegex);
    
    return segments.map((segment, index) => {
      // Check if the segment matches our note pattern
      if (segment.match(noteRegex)) {
        // Use the defined color or default to black
        const color = colorSettings[segment] || 'black';
        return <span key={index} style={{ color }}>{segment}</span>;
      }
      // Return regular text
      return <span key={index}>{segment}</span>;
    });
  };

  // Available kalimba notes for the settings panel
  const availableNotes = Object.keys(defaultColors);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Kalimba Note Taker</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side - Notes editor */}
        <div className="w-full md:w-3/5">
          <div className="card">
            <div className="mb-4 flex justify-between">
              <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="btn btn-primary"
              >
                {isSettingsOpen ? 'Close Settings' : 'Open Color Settings'}
              </button>
              
              <button 
                onClick={exportToPDF}
                className="btn btn-success"
              >
                Export to PDF
              </button>
            </div>
            
            {/* Settings panel */}
            {isSettingsOpen && (
              <div className="bg-gray-100 p-4 mb-4 rounded shadow-md">
                <h2 className="text-xl font-bold mb-2">Color Settings</h2>
                
                <div className="flex flex-wrap gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Select Note</label>
                    <select 
                      value={selectedNote}
                      onChange={(e) => setSelectedNote(e.target.value)}
                      className="border rounded p-2 bg-white"
                    >
                      {availableNotes.map(note => (
                        <option key={note} value={note}>{note}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Select Color</label>
                    <input 
                      type="color" 
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="h-10 w-20"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <button 
                      onClick={updateColorSetting}
                      className="btn btn-primary"
                    >
                      Update Color
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(colorSettings).map(([note, color]) => (
                    <div 
                      key={note} 
                      className="flex items-center border rounded p-2 bg-white cursor-pointer"
                      onClick={() => {
                        setSelectedNote(note);
                        setSelectedColor(color);
                      }}
                    >
                      <span className="mr-2">{note}:</span>
                      <div 
                        className="h-4 w-4 rounded-full" 
                        style={{ backgroundColor: color }}
                      ></div>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={resetToDefaultColors}
                  className="btn btn-danger"
                >
                  Reset to Default Colors
                </button>
              </div>
            )}
            
            {/* Text editor */}
            <div className="mb-4">
              <textarea
                value={notes}
                onChange={handleNotesChange}
                className="w-full h-72 p-4 border rounded"
                placeholder="Type your kalimba notes here... (e.g., 1 3 5 4 3 1)"
              ></textarea>
            </div>
            
            {/* Rendered colored notes */}
            <div className="text-preview whitespace-pre-wrap leading-relaxed">
              <h2 className="text-xl font-bold mb-2">Preview:</h2>
              {renderColoredText()}
            </div>
          </div>
        </div>
        
        {/* Right side - Kalimba Visualization */}
        <div className="w-full md:w-2/5">
          <div className="card h-full">
            <h2 className="text-xl font-bold mb-4">Kalimba Visualization</h2>
            <div className="kalimba-visualization">
              {/* Kalimba shape */}
              <div className="relative w-full max-w-sm mx-auto h-96 bg-amber-100 rounded-b-full border-2 border-amber-700">
                {/* Kalimba tines */}
                {[...Array(17)].map((_, index) => {
                  const noteNumber = Math.floor(index / 2) + 1;
                  let note;
                  
                  // Determine note based on tine position
                  if (index === 0) note = "1";
                  else if (index === 16) note = "1'";
                  else if (index % 2 === 0) note = `${noteNumber}'`;
                  else note = `${noteNumber}`;
                  
                  return (
                    <div 
                      key={index}
                      className="absolute bottom-0 w-3 rounded-t-md shadow-md border border-gray-400 transform -translate-x-1/2"
                      style={{ 
                        left: `${(index + 1) * 100 / 18}%`, 
                        height: `${60 + (index % 2 === 0 ? 15 : 0)}%`,
                        backgroundColor: colorSettings[note] || 'gray'
                      }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold">
                        {note}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
