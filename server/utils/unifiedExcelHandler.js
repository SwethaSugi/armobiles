const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '../data');
const UNIFIED_FILE = path.join(DATA_DIR, 'data.xlsx');

// Sheet names
const SHEETS = {
  USERS: 'Users',
  PRODUCTS: 'Products',
  CATEGORIES: 'Categories',
  REPAIRS: 'Repairs',
  BILLS: 'Bills',
  SALES: 'Sales',
  SHOP_SETTINGS: 'ShopSettings',
  OTHERS: 'Others',
  OTHER_CATEGORIES: 'OtherCategories'
};

// Ensure data directory exists
const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

// Read workbook or create new one
const getWorkbook = () => {
  ensureDataDir();
  if (fs.existsSync(UNIFIED_FILE)) {
    return XLSX.readFile(UNIFIED_FILE);
  }
  return XLSX.utils.book_new();
};

// Read data from a specific sheet
const readSheet = (sheetName) => {
  try {
    const workbook = getWorkbook();
    if (!workbook.SheetNames.includes(sheetName)) {
      return [];
    }
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      return [];
    }
    return XLSX.utils.sheet_to_json(worksheet);
  } catch (error) {
    console.error(`Error reading sheet ${sheetName}:`, error);
    return [];
  }
};

// Write data to a specific sheet with retry logic
const writeSheet = (sheetName, data, retries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      ensureDataDir();
      const workbook = getWorkbook();
      
      // Create worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Remove existing sheet if it exists
      if (workbook.SheetNames.includes(sheetName)) {
        workbook.Sheets[sheetName] = worksheet;
      } else {
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }
      
      // Write file
      XLSX.writeFile(workbook, UNIFIED_FILE);
      return; // Success, exit function
    } catch (error) {
      lastError = error;
      
      // Check if it's a file lock error
      if (error.code === 'EBUSY' || error.message.includes('locked') || error.message.includes('busy')) {
        if (attempt < retries) {
          // Wait before retrying (exponential backoff)
          const waitTime = attempt * 200; // 200ms, 400ms, 600ms
          console.warn(`File locked, retrying in ${waitTime}ms... (Attempt ${attempt}/${retries})`);
          const start = Date.now();
          while (Date.now() - start < waitTime) {
            // Busy wait
          }
          continue; // Retry
        } else {
          // All retries failed
          console.error(`Error writing sheet ${sheetName}: File is locked. Please close data.xlsx if it's open.`);
          throw new Error('Excel file is locked. Please close data.xlsx if it is open in Excel or another program.');
        }
      } else {
        // Not a lock error, throw immediately
        console.error(`Error writing sheet ${sheetName}:`, error);
        throw error;
      }
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
};

// Append data to a sheet (for adding single records)
const appendToSheet = (sheetName, newRecord) => {
  try {
    const existingData = readSheet(sheetName);
    existingData.push(newRecord);
    writeSheet(sheetName, existingData);
  } catch (error) {
    console.error(`Error appending to sheet ${sheetName}:`, error);
    throw error;
  }
};

// Update a record in a sheet by ID
const updateSheetRecord = (sheetName, id, updatedRecord) => {
  try {
    const existingData = readSheet(sheetName);
    const index = existingData.findIndex(record => 
      (record.id || record.ID) == id
    );
    if (index !== -1) {
      existingData[index] = { ...existingData[index], ...updatedRecord };
      writeSheet(sheetName, existingData);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error updating record in sheet ${sheetName}:`, error);
    throw error;
  }
};

// Delete a record from a sheet by ID
const deleteSheetRecord = (sheetName, id) => {
  try {
    const existingData = readSheet(sheetName);
    const filtered = existingData.filter(record => 
      (record.id || record.ID) != id
    );
    writeSheet(sheetName, filtered);
    return filtered.length < existingData.length;
  } catch (error) {
    console.error(`Error deleting record from sheet ${sheetName}:`, error);
    throw error;
  }
};

// Get next ID for a sheet
const getNextId = (sheetName) => {
  try {
    const data = readSheet(sheetName);
    if (data.length === 0) return 1;
    
    const ids = data.map(record => {
      const id = record.id || record.ID;
      if (id === undefined || id === null) return 0;
      const numId = typeof id === 'number' ? id : parseInt(id);
      return isNaN(numId) ? 0 : numId;
    }).filter(id => id > 0);
    
    if (ids.length === 0) return 1;
    
    const maxId = Math.max(...ids);
    return isNaN(maxId) ? 1 : maxId + 1;
  } catch (error) {
    console.error(`Error getting next ID for ${sheetName}:`, error);
    return 1;
  }
};

// Migrate existing separate Excel files to unified file
const migrateExistingFiles = () => {
  try {
    const workbook = getWorkbook();
    let migrated = false;

    // Migrate users.xlsx
    const usersFile = path.join(DATA_DIR, 'users.xlsx');
    if (fs.existsSync(usersFile) && !workbook.SheetNames.includes(SHEETS.USERS)) {
      const userWorkbook = XLSX.readFile(usersFile);
      if (userWorkbook.SheetNames.length > 0) {
        const userSheet = userWorkbook.Sheets[userWorkbook.SheetNames[0]];
        const users = XLSX.utils.sheet_to_json(userSheet);
        if (users.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(users);
          XLSX.utils.book_append_sheet(workbook, worksheet, SHEETS.USERS);
          migrated = true;
        }
      }
    }

    // Migrate products.xlsx
    const productsFile = path.join(DATA_DIR, 'products.xlsx');
    if (fs.existsSync(productsFile) && !workbook.SheetNames.includes(SHEETS.PRODUCTS)) {
      const productWorkbook = XLSX.readFile(productsFile);
      if (productWorkbook.SheetNames.length > 0) {
        const productSheet = productWorkbook.Sheets[productWorkbook.SheetNames[0]];
        const products = XLSX.utils.sheet_to_json(productSheet);
        if (products.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(products);
          XLSX.utils.book_append_sheet(workbook, worksheet, SHEETS.PRODUCTS);
          migrated = true;
        }
      }
    }

    // Migrate categories.xlsx
    const categoriesFile = path.join(DATA_DIR, 'categories.xlsx');
    if (fs.existsSync(categoriesFile) && !workbook.SheetNames.includes(SHEETS.CATEGORIES)) {
      const categoryWorkbook = XLSX.readFile(categoriesFile);
      if (categoryWorkbook.SheetNames.length > 0) {
        const categorySheet = categoryWorkbook.Sheets[categoryWorkbook.SheetNames[0]];
        const categories = XLSX.utils.sheet_to_json(categorySheet);
        if (categories.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(categories);
          XLSX.utils.book_append_sheet(workbook, worksheet, SHEETS.CATEGORIES);
          migrated = true;
        }
      }
    }

    // Migrate repairs.xlsx
    const repairsFile = path.join(DATA_DIR, 'repairs.xlsx');
    if (fs.existsSync(repairsFile) && !workbook.SheetNames.includes(SHEETS.REPAIRS)) {
      const repairWorkbook = XLSX.readFile(repairsFile);
      if (repairWorkbook.SheetNames.length > 0) {
        const repairSheet = repairWorkbook.Sheets[repairWorkbook.SheetNames[0]];
        const repairs = XLSX.utils.sheet_to_json(repairSheet);
        if (repairs.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(repairs);
          XLSX.utils.book_append_sheet(workbook, worksheet, SHEETS.REPAIRS);
          migrated = true;
        }
      }
    }

    // Migrate bills.xlsx
    const billsFile = path.join(DATA_DIR, 'bills.xlsx');
    if (fs.existsSync(billsFile) && !workbook.SheetNames.includes(SHEETS.BILLS)) {
      const billWorkbook = XLSX.readFile(billsFile);
      if (billWorkbook.SheetNames.length > 0) {
        const billSheet = billWorkbook.Sheets[billWorkbook.SheetNames[0]];
        const bills = XLSX.utils.sheet_to_json(billSheet);
        if (bills.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(bills);
          XLSX.utils.book_append_sheet(workbook, worksheet, SHEETS.BILLS);
          migrated = true;
        }
      }
    }

    // Migrate sales.xlsx
    const salesFile = path.join(DATA_DIR, 'sales.xlsx');
    if (fs.existsSync(salesFile) && !workbook.SheetNames.includes(SHEETS.SALES)) {
      const salesWorkbook = XLSX.readFile(salesFile);
      if (salesWorkbook.SheetNames.length > 0) {
        const salesSheet = salesWorkbook.Sheets[salesWorkbook.SheetNames[0]];
        const sales = XLSX.utils.sheet_to_json(salesSheet);
        if (sales.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(sales);
          XLSX.utils.book_append_sheet(workbook, worksheet, SHEETS.SALES);
          migrated = true;
        }
      }
    }

    // Migrate shop-settings.xlsx
    const shopSettingsFile = path.join(DATA_DIR, 'shop-settings.xlsx');
    if (fs.existsSync(shopSettingsFile) && !workbook.SheetNames.includes(SHEETS.SHOP_SETTINGS)) {
      const settingsWorkbook = XLSX.readFile(shopSettingsFile);
      if (settingsWorkbook.SheetNames.length > 0) {
        const settingsSheet = settingsWorkbook.Sheets[settingsWorkbook.SheetNames[0]];
        const settings = XLSX.utils.sheet_to_json(settingsSheet);
        if (settings.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(settings);
          XLSX.utils.book_append_sheet(workbook, worksheet, SHEETS.SHOP_SETTINGS);
          migrated = true;
        }
      }
    }

    // Migrate others.xlsx
    const othersFile = path.join(DATA_DIR, 'others.xlsx');
    if (fs.existsSync(othersFile) && !workbook.SheetNames.includes(SHEETS.OTHERS)) {
      const othersWorkbook = XLSX.readFile(othersFile);
      if (othersWorkbook.SheetNames.length > 0) {
        const othersSheet = othersWorkbook.Sheets[othersWorkbook.SheetNames[0]];
        const others = XLSX.utils.sheet_to_json(othersSheet);
        if (others.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(others);
          XLSX.utils.book_append_sheet(workbook, worksheet, SHEETS.OTHERS);
          migrated = true;
        }
      }
    }

    // Migrate other-categories.xlsx
    const otherCategoriesFile = path.join(DATA_DIR, 'other-categories.xlsx');
    if (fs.existsSync(otherCategoriesFile) && !workbook.SheetNames.includes(SHEETS.OTHER_CATEGORIES)) {
      const otherCatWorkbook = XLSX.readFile(otherCategoriesFile);
      if (otherCatWorkbook.SheetNames.length > 0) {
        const otherCatSheet = otherCatWorkbook.Sheets[otherCatWorkbook.SheetNames[0]];
        const otherCats = XLSX.utils.sheet_to_json(otherCatSheet);
        if (otherCats.length > 0) {
          const worksheet = XLSX.utils.json_to_sheet(otherCats);
          XLSX.utils.book_append_sheet(workbook, worksheet, SHEETS.OTHER_CATEGORIES);
          migrated = true;
        }
      }
    }

    // Save workbook if any migration occurred
    if (migrated) {
      XLSX.writeFile(workbook, UNIFIED_FILE);
      console.log('✅ Migrated existing Excel files to unified data.xlsx');
    }

    return migrated;
  } catch (error) {
    console.error('Error migrating existing files:', error);
    return false;
  }
};

// Reset all data (clear all sheets except Users to maintain login)
const resetAllData = (retries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      ensureDataDir();
      const workbook = getWorkbook();
      
      // Keep Users sheet, clear all others
      const sheetsToClear = [
        SHEETS.PRODUCTS,
        SHEETS.CATEGORIES,
        SHEETS.REPAIRS,
        SHEETS.BILLS,
        SHEETS.SALES,
        SHEETS.SHOP_SETTINGS,
        SHEETS.OTHERS,
        SHEETS.OTHER_CATEGORIES
      ];
      
      // Clear each sheet by writing empty array
      sheetsToClear.forEach(sheetName => {
        const emptyData = [];
        const worksheet = XLSX.utils.json_to_sheet(emptyData);
        
        if (workbook.SheetNames.includes(sheetName)) {
          workbook.Sheets[sheetName] = worksheet;
        } else {
          XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        }
      });
      
      // Write file
      XLSX.writeFile(workbook, UNIFIED_FILE);
      console.log('✅ All data reset successfully (Users preserved)');
      return true;
    } catch (error) {
      lastError = error;
      
      // Check if it's a file lock error
      if (error.code === 'EBUSY' || error.message.includes('locked') || error.message.includes('busy')) {
        if (attempt < retries) {
          // Wait before retrying (exponential backoff)
          const waitTime = attempt * 200;
          console.warn(`File locked, retrying reset in ${waitTime}ms... (Attempt ${attempt}/${retries})`);
          const start = Date.now();
          while (Date.now() - start < waitTime) {
            // Busy wait
          }
          continue; // Retry
        } else {
          console.error('Error resetting data: File is locked. Please close data.xlsx if it\'s open.');
          throw new Error('Excel file is locked. Please close data.xlsx if it is open in Excel or another program.');
        }
      } else {
        console.error('Error resetting data:', error);
        throw error;
      }
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
};

module.exports = {
  DATA_DIR,
  UNIFIED_FILE,
  SHEETS,
  ensureDataDir,
  readSheet,
  writeSheet,
  appendToSheet,
  updateSheetRecord,
  deleteSheetRecord,
  getNextId,
  migrateExistingFiles,
  resetAllData
};