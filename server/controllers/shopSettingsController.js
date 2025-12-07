const {
  readShopSettings,
  writeShopSettings
} = require('../utils/shopSettingsExcelHandler');

const getShopSettings = async (req, res) => {
  try {
    const settings = await readShopSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching shop settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop settings'
    });
  }
};

const saveShopSettings = async (req, res) => {
  try {
    const {
      shopName,
      shopPhone,
      shopEmail,
      shopGstin,
      shopAddress,
      defaultCgstRate,
      defaultSgstRate,
      defaultIgstRate,
      shopLogoUrl
    } = req.body;

    if (!shopName || !shopName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Shop name is required'
      });
    }

    const settings = {
      shopName: shopName.trim(),
      shopPhone: shopPhone ? shopPhone.trim() : '',
      shopEmail: shopEmail ? shopEmail.trim() : '',
      shopGstin: shopGstin ? shopGstin.trim() : '',
      shopAddress: shopAddress ? shopAddress.trim() : '',
      defaultCgstRate: parseFloat(defaultCgstRate || 9.0),
      defaultSgstRate: parseFloat(defaultSgstRate || 9.0),
      defaultIgstRate: parseFloat(defaultIgstRate || 18.0),
      shopLogoUrl: shopLogoUrl ? shopLogoUrl.trim() : '',
      updatedAt: new Date().toISOString()
    };

    await writeShopSettings(settings);

    res.json({
      success: true,
      message: 'Shop settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error saving shop settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving shop settings'
    });
  }
};

module.exports = {
  getShopSettings,
  saveShopSettings
};