/**
 * Local storage service for flashcard app
 */

const STORAGE_KEYS = {
  FLASHCARD_DATA: 'flashcard_data',
  USER_PROGRESS: 'user_progress',
  LAST_UPDATED: 'last_updated'
};

/**
 * Save flashcard data to local storage
 * @param {Object} data - The flashcard data to save
 */
export const saveFlashcardData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FLASHCARD_DATA, JSON.stringify(data));
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, new Date().toISOString());
  } catch (error) {
    console.error('Error saving flashcard data to localStorage:', error);
  }
};

/**
 * Load flashcard data from local storage
 * @returns {Object|null} The cached flashcard data or null if not found
 */
export const loadFlashcardData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FLASHCARD_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading flashcard data from localStorage:', error);
    return null;
  }
};

/**
 * Save user progress for a specific section
 * @param {string} sectionTitle - The section title
 * @param {Object} progress - Progress data (e.g., completed cards, current index, wrong cards)
 */
export const saveProgress = (sectionTitle, progress) => {
  try {
    const allProgress = loadAllProgress();
    allProgress[sectionTitle] = {
      ...progress,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(allProgress));
  } catch (error) {
    console.error('Error saving progress to localStorage:', error);
  }
};

/**
 * Load progress for a specific section
 * @param {string} sectionTitle - The section title
 * @returns {Object|null} Progress data or null if not found
 */
export const loadProgress = (sectionTitle) => {
  try {
    const allProgress = loadAllProgress();
    return allProgress[sectionTitle] || null;
  } catch (error) {
    console.error('Error loading progress from localStorage:', error);
    return null;
  }
};

/**
 * Load all progress data
 * @returns {Object} All progress data
 */
export const loadAllProgress = () => {
  try {
    const progress = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    return progress ? JSON.parse(progress) : {};
  } catch (error) {
    console.error('Error loading all progress from localStorage:', error);
    return {};
  }
};

/**
 * Clear all cached data
 */
export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

/**
 * Clear progress for a specific section
 * @param {string} sectionTitle - The section title
 */
export const clearSectionProgress = (sectionTitle) => {
  try {
    const allProgress = loadAllProgress();
    delete allProgress[sectionTitle];
    localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(allProgress));
  } catch (error) {
    console.error('Error clearing section progress from localStorage:', error);
  }
};

/**
 * Check if cached data exists and is recent
 * @param {number} maxAgeHours - Maximum age in hours (default: 24)
 * @returns {boolean} True if cache is valid
 */
export const isCacheValid = (maxAgeHours = 24) => {
  try {
    const lastUpdated = localStorage.getItem(STORAGE_KEYS.LAST_UPDATED);
    if (!lastUpdated) return false;
    
    const lastUpdateTime = new Date(lastUpdated);
    const now = new Date();
    const hoursDiff = (now - lastUpdateTime) / (1000 * 60 * 60);
    
    return hoursDiff < maxAgeHours;
  } catch (error) {
    console.error('Error checking cache validity:', error);
    return false;
  }
};