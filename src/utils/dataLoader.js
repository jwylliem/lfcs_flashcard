/**
 * Data loading utility for flashcard data
 */

// Cache for loaded data
let cachedData = null;

/**
 * Fetch flashcard data from the JSON file
 * @returns {Promise<Object>} The flashcard data
 */
export const loadFlashcardData = async () => {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch('/data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    cachedData = data;
    return data;
  } catch (error) {
    console.error('Error loading flashcard data:', error);
    throw error;
  }
};

/**
 * Get all available sections
 * @returns {Promise<Array>} Array of section objects with title and command count
 */
export const getSections = async () => {
  const data = await loadFlashcardData();
  return data.sections.map(section => ({
    title: section.title,
    commandCount: section.commands.length
  }));
};

/**
 * Get commands for a specific section
 * @param {string} sectionTitle - The title of the section
 * @returns {Promise<Array>} Array of command objects
 */
export const getCommandsBySection = async (sectionTitle) => {
  const data = await loadFlashcardData();
  const section = data.sections.find(s => s.title === sectionTitle);
  return section ? section.commands : [];
};

/**
 * Clear the cached data (useful for testing or forced refresh)
 */
export const clearCache = () => {
  cachedData = null;
};