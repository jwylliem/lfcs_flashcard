import React, { useState } from 'react';
import SectionSelector from './components/SectionSelector';
import FlashCard from './components/FlashCard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('sections'); // 'sections' or 'flashcards'
  const [selectedSection, setSelectedSection] = useState(null);

  const handleSectionSelect = (sectionTitle) => {
    setSelectedSection(sectionTitle);
    setCurrentView('flashcards');
  };

  const handleBackToSections = () => {
    setCurrentView('sections');
    setSelectedSection(null);
  };

  return (
    <div className="app">
      {currentView === 'sections' ? (
        <SectionSelector onSectionSelect={handleSectionSelect} />
      ) : (
        <FlashCard 
          sectionTitle={selectedSection} 
          onBack={handleBackToSections} 
        />
      )}
    </div>
  );
}

export default App;
