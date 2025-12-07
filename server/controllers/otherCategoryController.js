const {
  readOtherCategories,
  writeOtherCategories,
  getNextOtherCategoryId
} = require('../utils/otherCategoryExcelHandler');

const getOtherCategories = async (req, res) => {
  try {
    const categories = await readOtherCategories();
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

const getOtherCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const categories = await readOtherCategories();
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

const createOtherCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const categories = await readOtherCategories();
    const categoryWithIds = categories.map((cat, index) => {
      if (typeof cat === 'string') {
        return { id: index + 1, name: cat, description: '' };
      }
      return cat;
    });

    const existingCategory = categoryWithIds.find(
      c => c.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }

    const newId = await getNextOtherCategoryId();
    const newCategory = {
      id: newId,
      name: name.trim(),
      description: description ? description.trim() : ''
    };

    categoryWithIds.push(newCategory);
    await writeOtherCategories(categoryWithIds.map(c => ({ name: c.name, description: c.description })));

    res.json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category'
    });
  }
};

const updateOtherCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const categories = await readOtherCategories();
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

    await writeOtherCategories(categoryWithIds.map(c => ({ name: c.name, description: c.description })));

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

const deleteOtherCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categories = await readOtherCategories();
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

    await writeOtherCategories(filteredCategories.map(c => ({ name: c.name, description: c.description })));

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
  getOtherCategories,
  getOtherCategoryById,
  createOtherCategory,
  updateOtherCategory,
  deleteOtherCategory
};