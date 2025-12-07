const {
  readProducts,
  writeProducts,
  getNextProductId,
  readCategories
} = require('../utils/productExcelHandler');

const getAllProducts = async (req, res) => {
  try {
    const products = await readProducts();
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await readProducts();
    const product = products.find(p => p.id === parseInt(id));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, category, quantity, buyPrice, sellPrice, notes } = req.body;

    if (!name || !category || quantity === undefined || !buyPrice || !sellPrice) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const products = await readProducts();
    const newId = await getNextProductId();

    const newProduct = {
      id: newId,
      name: name.trim(),
      category: category.trim(),
      quantity: parseInt(quantity),
      buyPrice: parseFloat(buyPrice),
      sellPrice: parseFloat(sellPrice),
      notes: notes ? notes.trim() : '',
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);
    await writeProducts(products);

    res.json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product'
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, buyPrice, sellPrice, notes } = req.body;

    const products = await readProducts();
    const productIndex = products.findIndex(p => p.id === parseInt(id));

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    products[productIndex] = {
      ...products[productIndex],
      name: name.trim(),
      category: category.trim(),
      quantity: parseInt(quantity),
      buyPrice: parseFloat(buyPrice),
      sellPrice: parseFloat(sellPrice),
      notes: notes ? notes.trim() : '',
      updatedAt: new Date().toISOString()
    };

    await writeProducts(products);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: products[productIndex]
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product'
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await readProducts();
    const filteredProducts = products.filter(p => p.id !== parseInt(id));

    if (products.length === filteredProducts.length) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await writeProducts(filteredProducts);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product'
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};