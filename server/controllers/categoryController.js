const {
  readCategories,
  writeCategories,
  getNextCategoryId
} = require('../utils/productExcelHandler');

const getCategories = async (req, res) => {
  try {
    const categories = await readCategories();
    // Convert to array of objects with IDs if they're strings
    const categoriesWithIds = categories.map((cat, index) => {
      if (typeof cat === 'string') {
        return { id: index + 1, name: cat, description: '' };
      }
      return cat;
    });
    res.json({
      success: true,
      data: categoriesWithIds
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const categories = await readCategories();
    const categoryWithIds = categories.map((cat, index) => {
      if (typeof cat === 'string') {
        return { id: index + 1, name: cat, description: '' };
      }
      return cat;
    });
    const category = categoryWithIds.find(c => c.id === parseInt(id));

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category'
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const categories = await readCategories();
    const categoryWithIds = categories.map((cat, index) => {
      if (typeof cat === 'string') {
        return { id: index + 1, name: cat, description: '' };
      }
      // Ensure ID exists
      if (!cat.id && !cat.ID) {
        return { id: index + 1, name: cat.name || '', description: cat.description || '' };
      }
      return {
        id: cat.id || cat.ID || index + 1,
        name: cat.name || '',
        description: cat.description || ''
      };
    });

    // Check if category already exists
    const existingCategory = categoryWithIds.find(
      c => c.name && c.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }

    // Calculate next ID from existing categories
    let newId = 1;
    if (categoryWithIds.length > 0) {
      const existingIds = categoryWithIds
        .map(c => c.id || 0)
        .filter(id => id > 0);
      if (existingIds.length > 0) {
        newId = Math.max(...existingIds) + 1;
      } else {
        newId = categoryWithIds.length + 1;
      }
    }

    const newCategory = {
      id: newId,
      name: name.trim(),
      description: description ? description.trim() : ''
    };

    categoryWithIds.push(newCategory);
    await writeCategories(categoryWithIds);

    res.json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    console.error('Error stack:', error.stack);
    
    let errorMessage = 'Error creating category';
    if (error.message && error.message.includes('locked')) {
      errorMessage = 'Excel file is locked. Please close data.xlsx if it is open in Excel or another program, then try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const categories = await readCategories();
    const categoryWithIds = categories.map((cat, index) => {
      if (typeof cat === 'string') {
        return { id: index + 1, name: cat, description: '' };
      }
      return cat;
    });

    const categoryIndex = categoryWithIds.findIndex(c => c.id === parseInt(id));

    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if new name conflicts with existing category
    const existingCategory = categoryWithIds.find(
      (c, idx) => idx !== categoryIndex && c.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category name already exists'
      });
    }

    categoryWithIds[categoryIndex] = {
      ...categoryWithIds[categoryIndex],
      name: name.trim(),
      description: description ? description.trim() : ''
    };

    await writeCategories(categoryWithIds);

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: categoryWithIds[categoryIndex]
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category'
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categories = await readCategories();
    const categoryWithIds = categories.map((cat, index) => {
      if (typeof cat === 'string') {
        return { id: index + 1, name: cat, description: '' };
      }
      return cat;
    });

    const filteredCategories = categoryWithIds.filter(c => c.id !== parseInt(id));

    if (categories.length === filteredCategories.length) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await writeCategories(filteredCategories.map(c => ({ name: c.name, description: c.description })));

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category'
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};