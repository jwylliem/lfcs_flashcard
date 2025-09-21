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
  const [wrongCards, setWrongCards] = useState(new Set());
  const [showCompleted, setShowCompleted] = useState(false);
  const [reviewMode, setReviewMode] = useState('all'); // 'all', 'wrong'
  const [filteredCommands, setFilteredCommands] = useState([]);
  const [originalIndexMap, setOriginalIndexMap] = useState([]);

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
          setWrongCards(new Set(progress.wrongCardIndices || []));
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

  // Filter commands based on review mode
  useEffect(() => {
    if (commands.length > 0) {
      if (reviewMode === 'wrong') {
        const wrongCommandsData = commands.filter((_, index) => wrongCards.has(index));
        const wrongIndices = Array.from(wrongCards).sort((a, b) => a - b);
        setFilteredCommands(wrongCommandsData);
        setOriginalIndexMap(wrongIndices);
        setCurrentIndex(0);
      } else {
        setFilteredCommands(commands);
        setOriginalIndexMap(commands.map((_, index) => index));
      }
    }
  }, [commands, reviewMode, wrongCards]);

  // Save progress whenever it changes
  useEffect(() => {
    if (commands.length > 0) {
      const progress = {
        currentIndex: reviewMode === 'all' ? currentIndex : 0,
        completedCardIndices: Array.from(completedCards),
        wrongCardIndices: Array.from(wrongCards),
        completedCards: completedCards.size,
        wrongCards: wrongCards.size,
        totalCards: commands.length,
        score: calculateScore()
      };
      saveProgress(sectionTitle, progress);
    }
  }, [currentIndex, completedCards, wrongCards, commands.length, sectionTitle, reviewMode]);

  const calculateScore = () => {
    if (commands.length === 0) return 0;
    const correctCards = completedCards.size - wrongCards.size;
    return Math.max(0, Math.round((correctCards / commands.length) * 100));
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      const actualIndex = reviewMode === 'wrong' ? originalIndexMap[currentIndex] : currentIndex;
      // Mark as completed when flipped to see the answer
      setCompletedCards(prev => new Set([...prev, actualIndex]));
    }
  };

  const handleMarkWrong = () => {
    const actualIndex = reviewMode === 'wrong' ? originalIndexMap[currentIndex] : currentIndex;
    setWrongCards(prev => new Set([...prev, actualIndex]));
    // Also mark as completed since they've seen it
    setCompletedCards(prev => new Set([...prev, actualIndex]));
    
    // Auto advance to next card - flip back first, then advance
    setIsFlipped(false); // Flip back to question immediately
    setTimeout(() => {
      if (currentIndex < filteredCommands.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 300);
  };

  const handleMarkCorrect = () => {
    const actualIndex = reviewMode === 'wrong' ? originalIndexMap[currentIndex] : currentIndex;
    // Remove from wrong cards if it was marked wrong before
    setWrongCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(actualIndex);
      return newSet;
    });
    // Mark as completed
    setCompletedCards(prev => new Set([...prev, actualIndex]));
    
    // Auto advance to next card - flip back first, then advance
    setIsFlipped(false); // Flip back to question immediately
    setTimeout(() => {
      if (currentIndex < filteredCommands.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 300);
  };

  const handleNext = () => {
    if (currentIndex < filteredCommands.length - 1) {
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
    setWrongCards(new Set());
    setReviewMode('all');
  };

  const toggleReviewMode = () => {
    if (reviewMode === 'all') {
      if (wrongCards.size > 0) {
        setReviewMode('wrong');
      }
    } else {
      setReviewMode('all');
    }
    setIsFlipped(false);
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

  if (reviewMode === 'wrong' && wrongCards.size === 0) {
    return (
      <div className="flashcard-container empty">
        <h2>🎉 No wrong cards!</h2>
        <p>You haven't marked any cards as wrong yet. Great job!</p>
        <button onClick={() => setReviewMode('all')}>Back to All Cards</button>
        <button onClick={onBack}>Back to Sections</button>
      </div>
    );
  }

  const currentCommand = filteredCommands[currentIndex];
  const actualIndex = reviewMode === 'wrong' ? originalIndexMap[currentIndex] : currentIndex;
  const progress = Math.round((completedCards.size / commands.length) * 100);
  const score = calculateScore();

  if (!currentCommand) {
    return (
      <div className="flashcard-container loading">
        <div className="loading-spinner"></div>
        <p>Loading flashcard...</p>
      </div>
    );
  }

  return (
    <div className="flashcard-container">
      <div className="flashcard-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Sections
        </button>
        <h2>{sectionTitle} {reviewMode === 'wrong' ? '(Wrong Cards)' : ''}</h2>
        <div className="progress-info">
          <span>Progress: {completedCards.size}/{commands.length} ({progress}%)</span>
          <span className="score-info">Score: {score}%</span>
          {wrongCards.size > 0 && (
            <span className="wrong-info">Wrong: {wrongCards.size}</span>
          )}
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
          className={`flashcard ${isFlipped ? 'flipped' : ''} ${completedCards.has(actualIndex) ? 'completed' : ''} ${wrongCards.has(actualIndex) ? 'wrong' : ''}`}
          onClick={handleCardClick}
        >
          <div className="flashcard-front">
            <div className="card-header">
              <span className="card-number">
                {reviewMode === 'wrong' ? `${currentIndex + 1} / ${filteredCommands.length}` : `${actualIndex + 1} / ${commands.length}`}
                {reviewMode === 'wrong' && ` (Original #${actualIndex + 1})`}
              </span>
              {completedCards.has(actualIndex) && !wrongCards.has(actualIndex) && <span className="completed-badge">✓</span>}
              {wrongCards.has(actualIndex) && <span className="wrong-badge">✗</span>}
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
              <span className="card-number">
                {reviewMode === 'wrong' ? `${currentIndex + 1} / ${filteredCommands.length}` : `${actualIndex + 1} / ${commands.length}`}
                {reviewMode === 'wrong' && ` (Original #${actualIndex + 1})`}
              </span>
              {completedCards.has(actualIndex) && !wrongCards.has(actualIndex) && <span className="completed-badge">✓</span>}
              {wrongCards.has(actualIndex) && <span className="wrong-badge">✗</span>}
            </div>
            <div className="card-content">
              <h3>Command:</h3>
              <code className="syntax">{currentCommand.syntax}</code>
              <div className="description-small">
                <strong>Description:</strong> {currentCommand.description}
              </div>
            </div>
            <div className="card-footer">
              <div className="answer-buttons">
                <button 
                  className="answer-button correct" 
                  onClick={(e) => { e.stopPropagation(); handleMarkCorrect(); }}
                  title="Mark as correct"
                >
                  ✓ Correct
                </button>
                <button 
                  className="answer-button wrong" 
                  onClick={(e) => { e.stopPropagation(); handleMarkWrong(); }}
                  title="Mark as wrong"
                >
                  ✗ Wrong
                </button>
              </div>
              <span className="hint">Click card to flip back</span>
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
            🔄 Reset All
          </button>
          <button 
            className={`control-button secondary ${reviewMode === 'wrong' ? 'active' : ''}`} 
            onClick={toggleReviewMode}
            disabled={wrongCards.size === 0}
          >
            {reviewMode === 'wrong' ? '📚 All Cards' : `❌ Wrong Cards (${wrongCards.size})`}
          </button>
          <button className="control-button secondary" onClick={toggleShowCompleted}>
            {showCompleted ? '👁️ Hide' : '👁️ Show'} Completed
          </button>
        </div>
        
        <button 
          className="control-button" 
          onClick={handleNext} 
          disabled={currentIndex === filteredCommands.length - 1}
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