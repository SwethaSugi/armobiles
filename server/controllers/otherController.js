const {
  readOthers,
  writeOthers,
  getNextOtherId
} = require('../utils/otherExcelHandler');

const getAllOthers = async (req, res) => {
  try {
    const others = await readOthers();
    res.json({
      success: true,
      data: others
    });
  } catch (error) {
    console.error('Error fetching others:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions'
    });
  }
};

const getOtherById = async (req, res) => {
  try {
    const { id } = req.params;
    const others = await readOthers();
    const other = others.find(o => o.id === parseInt(id));

    if (!other) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: other
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction'
    });
  }
};

const createOther = async (req, res) => {
  try {
    const { category, description, customerName, amount, notes } = req.body;

    if (!category || !description || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Category, description, and amount are required'
      });
    }

    const others = await readOthers();
    const newId = await getNextOtherId();

    const newOther = {
      id: newId,
      category: category.trim(),
      description: description.trim(),
      customerName: customerName ? customerName.trim() : '',
      amount: parseFloat(amount),
      notes: notes ? notes.trim() : '',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    others.push(newOther);
    await writeOthers(others);

    res.json({
      success: true,
      message: 'Transaction created successfully',
      data: newOther
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating transaction'
    });
  }
};

const updateOther = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, description, customerName, amount, notes } = req.body;

    const others = await readOthers();
    const otherIndex = others.findIndex(o => o.id === parseInt(id));

    if (otherIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    others[otherIndex] = {
      ...others[otherIndex],
      category: category.trim(),
      description: description.trim(),
      customerName: customerName ? customerName.trim() : '',
      amount: parseFloat(amount),
      notes: notes ? notes.trim() : '',
      updatedAt: new Date().toISOString()
    };

    await writeOthers(others);

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: others[otherIndex]
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating transaction'
    });
  }
};

const deleteOther = async (req, res) => {
  try {
    const { id } = req.params;
    const others = await readOthers();
    const filteredOthers = others.filter(o => o.id !== parseInt(id));

    if (others.length === filteredOthers.length) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await writeOthers(filteredOthers);

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting transaction'
    });
  }
};

module.exports = {
  getAllOthers,
  getOtherById,
  createOther,
  updateOther,
  deleteOther
};