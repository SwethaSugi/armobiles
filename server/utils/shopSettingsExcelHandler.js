const { readSheet, writeSheet, SHEETS } = require('./unifiedExcelHandler');

// Default shop settings
const getDefaultSettings = () => ({
  shopName: 'AR MOBILES AND AR ESEVAI',
  shopPhone: '8144476803',
  shopEmail: 'aresevainaduvai@gmail.com',
  shopGstin: '',
  shopAddress: 'NO.7, KAILASANATHAR KOVIL COMPLEX ,\nTANA SAVADI, NADUVEERAPATTU 607102',
  defaultCgstRate: 9.0,
  defaultSgstRate: 9.0,
  defaultIgstRate: 18.0,
  shopLogoUrl: ''
});

// Read shop settings from Excel
const readShopSettings = async () => {
  try {
    const settingsArray = readSheet(SHEETS.SHOP_SETTINGS);
    
    if (settingsArray.length === 0) {
      // Create default settings file
      const defaultSettings = getDefaultSettings();
      await writeShopSettings(defaultSettings);
      return defaultSettings;
    }

    const settings = settingsArray[0];
    return {
      shopName: settings.shopName || settings['Shop Name'] || getDefaultSettings().shopName,
      shopPhone: settings.shopPhone || settings['Shop Phone'] || getDefaultSettings().shopPhone,
      shopEmail: settings.shopEmail || settings['Shop Email'] || getDefaultSettings().shopEmail,
      shopGstin: settings.shopGstin || settings['Shop GSTIN'] || settings.GSTIN || '',
      shopAddress: settings.shopAddress || settings['Shop Address'] || getDefaultSettings().shopAddress,
      defaultCgstRate: parseFloat(settings.defaultCgstRate || settings['Default CGST Rate'] || 9.0),
      defaultSgstRate: parseFloat(settings.defaultSgstRate || settings['Default SGST Rate'] || 9.0),
      defaultIgstRate: parseFloat(settings.defaultIgstRate || settings['Default IGST Rate'] || 18.0),
      shopLogoUrl: settings.shopLogoUrl || settings['Shop Logo URL'] || ''
    };
  } catch (error) {
    console.error('Error reading shop settings:', error);
    return getDefaultSettings();
  }
};

// Write shop settings to Excel
const writeShopSettings = async (settings) => {
  try {
    const settingsArray = [settings];
    writeSheet(SHEETS.SHOP_SETTINGS, settingsArray);
  } catch (error) {
    console.error('Error writing shop settings:', error);
    throw error;
  }
};

module.exports = {
  readShopSettings,
  writeShopSettings
};