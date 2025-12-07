const {
  readRepairs,
  writeRepairs,
  getNextRepairId
} = require('../utils/repairExcelHandler');

const getAllRepairs = async (req, res) => {
  try {
    const repairs = await readRepairs();
    res.json({
      success: true,
      data: repairs
    });
  } catch (error) {
    console.error('Error fetching repairs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching repairs'
    });
  }
};

const getRepairById = async (req, res) => {
  try {
    const { id } = req.params;
    const repairs = await readRepairs();
    const repair = repairs.find(r => r.id === parseInt(id));

    if (!repair) {
      return res.status(404).json({
        success: false,
        message: 'Repair not found'
      });
    }

    res.json({
      success: true,
      data: repair
    });
  } catch (error) {
    console.error('Error fetching repair:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching repair'
    });
  }
};

const createRepair = async (req, res) => {
  try {
    const { customerName, customerPhone, deviceName, issue, estimatedCost, status, notes } = req.body;

    if (!customerName || !deviceName || !issue || estimatedCost === undefined || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const repairs = await readRepairs();
    const newId = await getNextRepairId();

    const newRepair = {
      id: newId,
      customerName: customerName.trim(),
      customerPhone: customerPhone ? customerPhone.trim() : '',
      deviceName: deviceName.trim(),
      issue: issue.trim(),
      estimatedCost: parseFloat(estimatedCost),
      status: status,
      notes: notes ? notes.trim() : '',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    repairs.push(newRepair);
    await writeRepairs(repairs);

    res.json({
      success: true,
      message: 'Service entry created successfully',
      data: newRepair
    });
  } catch (error) {
    console.error('Error creating repair:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating service entry'
    });
  }
};

const updateRepair = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, customerPhone, deviceName, issue, estimatedCost, status, notes } = req.body;

    const repairs = await readRepairs();
    const repairIndex = repairs.findIndex(r => r.id === parseInt(id));

    if (repairIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Repair not found'
      });
    }

    repairs[repairIndex] = {
      ...repairs[repairIndex],
      customerName: customerName.trim(),
      customerPhone: customerPhone ? customerPhone.trim() : '',
      deviceName: deviceName.trim(),
      issue: issue.trim(),
      estimatedCost: parseFloat(estimatedCost),
      status: status,
      notes: notes ? notes.trim() : '',
      updatedAt: new Date().toISOString()
    };

    await writeRepairs(repairs);

    res.json({
      success: true,
      message: 'Service entry updated successfully',
      data: repairs[repairIndex]
    });
  } catch (error) {
    console.error('Error updating repair:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service entry'
    });
  }
};

const deleteRepair = async (req, res) => {
  try {
    const { id } = req.params;
    const repairs = await readRepairs();
    const filteredRepairs = repairs.filter(r => r.id !== parseInt(id));

    if (repairs.length === filteredRepairs.length) {
      return res.status(404).json({
        success: false,
        message: 'Repair not found'
      });
    }

    await writeRepairs(filteredRepairs);

    res.json({
      success: true,
      message: 'Service entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting repair:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting service entry'
    });
  }
};

module.exports = {
  getAllRepairs,
  getRepairById,
  createRepair,
  updateRepair,
  deleteRepair
};