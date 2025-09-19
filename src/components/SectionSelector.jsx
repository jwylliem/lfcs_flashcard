import React, { useState, useEffect } from 'react';
import { getSections } from '../utils/dataLoader';
import { loadProgress } from '../utils/localStorage';

const SectionSelector = ({ onSectionSelect }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSections = async () => {
      try {
        setLoading(true);
        const sectionsData = await getSections();
        
        // Add progress information to each section
        const sectionsWithProgress = sectionsData.map(section => {
          const progress = loadProgress(section.title);
          return {
            ...section,
            progress: progress ? {
              completed: progress.completedCards || 0,
              total: section.commandCount,
              percentage: Math.round(((progress.completedCards || 0) / section.commandCount) * 100)
            } : {
              completed: 0,
              total: section.commandCount,
              percentage: 0
            }
          };
        });
        
        setSections(sectionsWithProgress);
      } catch (err) {
        setError('Failed to load sections. Please try again.');
        console.error('Error loading sections:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSections();
  }, []);

  const handleSectionClick = (section) => {
    onSectionSelect(section.title);
  };

  if (loading) {
    return (
      <div className="section-selector loading">
        <div className="loading-spinner"></div>
        <p>Loading sections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-selector error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="section-selector">
      <div className="header">
        <h1>🎯 Linux Flashcards</h1>
        <p>Choose a section to start studying</p>
      </div>
      
      <div className="sections-grid">
        {sections.map((section, index) => (
          <div 
            key={index} 
            className="section-card"
            onClick={() => handleSectionClick(section)}
          >
            <div className="section-header">
              <h3>{section.title}</h3>
              <span className="command-count">{section.commandCount} commands</span>
            </div>
            
            <div className="progress-info">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${section.progress.percentage}%` }}
                ></div>
              </div>
              <span className="progress-text">
                {section.progress.completed}/{section.progress.total} completed ({section.progress.percentage}%)
              </span>
            </div>
            
            <div className="section-footer">
              <span className="start-text">Click to start →</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="footer">
        <p>💡 Tip: Click on a flashcard to reveal the command syntax</p>
      </div>
    </div>
  );
};

export default SectionSelector;