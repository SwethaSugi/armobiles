const { readSheet, writeSheet, getNextId, SHEETS } = require('./unifiedExcelHandler');

// Read other categories from Excel
const readOtherCategories = async () => {
  try {
    let categories = readSheet(SHEETS.OTHER_CATEGORIES);
    
    if (categories.length === 0) {
      // Extract categories from others if categories file doesn't exist
      const { readOthers } = require('./otherExcelHandler');
      const others = await readOthers();
      const uniqueCategories = [...new Set(others.map(o => o.category).filter(Boolean))];
      if (uniqueCategories.length > 0) {
        const categoryObjects = uniqueCategories.map(cat => ({
          name: cat,
          description: ''
        }));
        await writeOtherCategories(categoryObjects);
        return categoryObjects;
      }
      // Return default categories if no transactions exist
      const defaultCategories = [
        { name: 'Recharge', description: 'Mobile/DTH Recharge' },
        { name: 'Bill Payment', description: 'Utility Bill Payments' },
        { name: 'Money Transfer', description: 'Money Transfer Services' },
        { name: 'Xerox', description: 'Photocopy Services' }
      ];
      await writeOtherCategories(defaultCategories);
      return defaultCategories;
    }
    
    return categories.map(c => ({
      name: c.name || c.Name || c.category || c.Category || '',
      description: c.description || c.Description || ''
    })).filter(c => c.name);
  } catch (error) {
    console.error('Error reading other categories:', error);
    return [];
  }
};

// Write other categories to Excel
const writeOtherCategories = async (categories) => {
  try {
    const data = categories.map(cat => {
      if (typeof cat === 'string') {
        return { name: cat, description: '' };
      }
      return {
        name: cat.name || cat.Name || '',
        description: cat.description || cat.Description || ''
      };
    });
    writeSheet(SHEETS.OTHER_CATEGORIES, data);
  } catch (error) {
    console.error('Error writing other categories:', error);
    throw error;
  }
};

// Get next category ID
const getNextOtherCategoryId = async () => {
  return getNextId(SHEETS.OTHER_CATEGORIES);
};

module.exports = {
  readOtherCategories,
  writeOtherCategories,
  getNextOtherCategoryId
};