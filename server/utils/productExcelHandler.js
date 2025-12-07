const { readSheet, writeSheet, getNextId, SHEETS } = require('./unifiedExcelHandler');

// Read products from Excel
const readProducts = async () => {
  try {
    const products = readSheet(SHEETS.PRODUCTS);
    return products.map(p => ({
      id: p.id || p.ID,
      name: p.name || p.Name,
      category: p.category || p.Category,
      quantity: p.quantity || p.Quantity || p.stock || p.Stock || 0,
      buyPrice: p.buyPrice || p['Buy Price'] || p.buy_price || 0,
      sellPrice: p.sellPrice || p['Sell Price'] || p.sell_price || 0,
      notes: p.notes || p.Notes || ''
    }));
  } catch (error) {
    console.error('Error reading products:', error);
    return [];
  }
};

// Write products to Excel
const writeProducts = async (products) => {
  try {
    writeSheet(SHEETS.PRODUCTS, products);
  } catch (error) {
    console.error('Error writing products:', error);
    throw error;
  }
};

// Get next product ID
const getNextProductId = async () => {
  return getNextId(SHEETS.PRODUCTS);
};

// Read categories from Excel
const readCategories = async () => {
  try {
    let categories = readSheet(SHEETS.CATEGORIES);
    
    // If no categories exist, try to extract from products
    if (categories.length === 0) {
      const products = await readProducts();
      const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
      if (uniqueCategories.length > 0) {
        const categoryObjects = uniqueCategories.map((cat, index) => ({
          id: index + 1,
          name: cat,
          description: ''
        }));
        await writeCategories(categoryObjects);
        return categoryObjects;
      }
      return [];
    }
    
    return categories.map((c, index) => ({
      id: c.id || c.ID || index + 1,
      name: c.name || c.Name || c.category || c.Category || '',
      description: c.description || c.Description || ''
    })).filter(c => c.name);
  } catch (error) {
    console.error('Error reading categories:', error);
    // Fallback to extracting from products
    const products = await readProducts();
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return uniqueCategories.map((cat, index) => ({ id: index + 1, name: cat, description: '' }));
  }
};

// Write categories to Excel
const writeCategories = async (categories) => {
  try {
    if (!categories || !Array.isArray(categories)) {
      throw new Error('Categories must be an array');
    }
    
    // Handle both string and object formats, preserve IDs
    const data = categories.map((cat, index) => {
      if (typeof cat === 'string') {
        return { id: index + 1, name: cat, description: '' };
      }
      if (!cat || typeof cat !== 'object') {
        return { id: index + 1, name: '', description: '' };
      }
      return {
        id: cat.id || cat.ID || (index + 1),
        name: cat.name || cat.Name || '',
        description: cat.description || cat.Description || ''
      };
    }).filter(cat => cat.name && cat.name.trim()); // Filter out empty names
    
    writeSheet(SHEETS.CATEGORIES, data);
  } catch (error) {
    console.error('Error writing categories:', error);
    console.error('Categories data:', JSON.stringify(categories, null, 2));
    throw error;
  }
};

// Get next category ID
const getNextCategoryId = async () => {
  return getNextId(SHEETS.CATEGORIES);
};

module.exports = {
  readProducts,
  writeProducts,
  getNextProductId,
  readCategories,
  writeCategories,
  getNextCategoryId
};