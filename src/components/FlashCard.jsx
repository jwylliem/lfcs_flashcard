import React, { useState, useEffect } from 'react';
import { getCommandsBySection } from '../utils/dataLoader';
import { saveProgress, loadProgress } from '../utils/localStorage';

const FlashCard = ({ sectionTitle, onBack }) => {
  const [commands, setCommands] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedCards, setCompletedCards] = useState(new Set());
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    const loadCommands = async () => {
      try {
        setLoading(true);
        const commandsData = await getCommandsBySection(sectionTitle);
        setCommands(commandsData);
        
        // Load progress
        const progress = loadProgress(sectionTitle);
        if (progress) {
          setCurrentIndex(progress.currentIndex || 0);
          setCompletedCards(new Set(progress.completedCardIndices || []));
        }
      } catch (err) {
        setError('Failed to load commands. Please try again.');
        console.error('Error loading commands:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCommands();
  }, [sectionTitle]);

  // Save progress whenever it changes
  useEffect(() => {
    if (commands.length > 0) {
      const progress = {
        currentIndex,
        completedCardIndices: Array.from(completedCards),
        completedCards: completedCards.size,
        totalCards: commands.length
      };
      saveProgress(sectionTitle, progress);
    }
  }, [currentIndex, completedCards, commands.length, sectionTitle]);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      // Mark as completed when flipped to see the answer
      setCompletedCards(prev => new Set([...prev, currentIndex]));
    }
  };

  const handleNext = () => {
    if (currentIndex < commands.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompletedCards(new Set());
  };

  const toggleShowCompleted = () => {
    setShowCompleted(!showCompleted);
  };

  if (loading) {
    return (
      <div className="flashcard-container loading">
        <div className="loading-spinner"></div>
        <p>Loading flashcards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flashcard-container error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={onBack}>Back to Sections</button>
      </div>
    );
  }

  if (commands.length === 0) {
    return (
      <div className="flashcard-container empty">
        <h2>No commands found</h2>
        <p>This section doesn't contain any commands.</p>
        <button onClick={onBack}>Back to Sections</button>
      </div>
    );
  }

  const currentCommand = commands[currentIndex];
  const progress = Math.round((completedCards.size / commands.length) * 100);

  return (
    <div className="flashcard-container">
      <div className="flashcard-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Sections
        </button>
        <h2>{sectionTitle}</h2>
        <div className="progress-info">
          <span>Progress: {completedCards.size}/{commands.length} ({progress}%)</span>
        </div>
      </div>

      <div className="flashcard-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flashcard-main">
        <div 
          className={`flashcard ${isFlipped ? 'flipped' : ''} ${completedCards.has(currentIndex) ? 'completed' : ''}`}
          onClick={handleCardClick}
        >
          <div className="flashcard-front">
            <div className="card-header">
              <span className="card-number">{currentIndex + 1} / {commands.length}</span>
              {completedCards.has(currentIndex) && <span className="completed-badge">✓</span>}
            </div>
            <div className="card-content">
              <h3>What command does this?</h3>
              <p className="description">{currentCommand.description}</p>
            </div>
            <div className="card-footer">
              <span className="hint">Click to reveal the command →</span>
            </div>
          </div>
          
          <div className="flashcard-back">
            <div className="card-header">
              <span className="card-number">{currentIndex + 1} / {commands.length}</span>
              <span className="completed-badge">✓</span>
            </div>
            <div className="card-content">
              <h3>Command:</h3>
              <code className="syntax">{currentCommand.syntax}</code>
              <div className="description-small">
                <strong>Description:</strong> {currentCommand.description}
              </div>
            </div>
            <div className="card-footer">
              <span className="hint">Click to flip back</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flashcard-controls">
        <button 
          className="control-button" 
          onClick={handlePrevious} 
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>
        
        <div className="center-controls">
          <button className="control-button secondary" onClick={handleReset}>
            🔄 Reset Progress
          </button>
          <button className="control-button secondary" onClick={toggleShowCompleted}>
            {showCompleted ? '👁️ Hide' : '👁️ Show'} Completed
          </button>
        </div>
        
        <button 
          className="control-button" 
          onClick={handleNext} 
          disabled={currentIndex === commands.length - 1}
        >
          Next →
        </button>
      </div>

      {showCompleted && (
        <div className="completed-list">
          <h4>Completed Cards ({completedCards.size}):</h4>
          <div className="completed-grid">
            {Array.from(completedCards).sort((a, b) => a - b).map(index => (
              <div 
                key={index} 
                className="completed-item"
                onClick={() => {
                  setCurrentIndex(index);
                  setIsFlipped(false);
                  setShowCompleted(false);
                }}
              >
                <span className="item-number">#{index + 1}</span>
                <span className="item-description">{commands[index].description.substring(0, 50)}...</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashCard;