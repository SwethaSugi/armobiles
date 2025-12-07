const { readSheet, writeSheet, SHEETS, ensureDataDir } = require('./unifiedExcelHandler');

// Read Excel file and return users array
const readExcelFile = async () => {
  try {
    const users = readSheet(SHEETS.USERS);
    
    // If no users exist, create default admin user
    if (users.length === 0) {
      await createDefaultExcelFile();
      return readSheet(SHEETS.USERS);
    }
    
    // Update existing user credentials if needed (one-time migration)
    await updateExistingUserCredentials();
    
    return readSheet(SHEETS.USERS);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw error;
  }
};

// Create default Excel file with admin user
const createDefaultExcelFile = async () => {
  try {
    ensureDataDir();

    // Default admin user (password: Admin@123)
    const defaultUsers = [
      {
        id: 1,
        username: 'armobiles',
        password: 'Admin@123', // In production, this should be hashed
        email: 'aresevainaduvai@gmail.com', // Email for password recovery
        role: 'admin'
      }
    ];

    writeSheet(SHEETS.USERS, defaultUsers);
    console.log('Default Excel file created with admin user');
  } catch (error) {
    console.error('Error creating default Excel file:', error);
    throw error;
  }
};

// Update existing user credentials (migrate from old admin to new credentials)
const updateExistingUserCredentials = async () => {
  try {
    const users = readSheet(SHEETS.USERS);
    
    if (users.length === 0) {
      // No users exist, create default
      await createDefaultExcelFile();
      return;
    }

    let updated = false;

    // Find and update old admin user
    const adminUserIndex = users.findIndex(u => 
      u.username === 'admin' || (u.username === 'armobiles' && u.password !== 'Admin@123')
    );

    if (adminUserIndex !== -1) {
      // Update existing admin user
      users[adminUserIndex] = {
        id: users[adminUserIndex].id || users[adminUserIndex].ID || 1,
        username: 'armobiles',
        password: 'Admin@123',
        email: 'aresevainaduvai@gmail.com',
        role: users[adminUserIndex].role || 'admin'
      };
      updated = true;
    } else {
      // Check if armobiles user already exists
      const armobilesUserIndex = users.findIndex(u => u.username === 'armobiles');
      
      if (armobilesUserIndex !== -1) {
        // Update existing armobiles user if credentials don't match
        const armobilesUser = users[armobilesUserIndex];
        if (armobilesUser.password !== 'Admin@123' || armobilesUser.email !== 'aresevainaduvai@gmail.com') {
          users[armobilesUserIndex] = {
            ...armobilesUser,
            id: armobilesUser.id || armobilesUser.ID || 1,
            password: 'Admin@123',
            email: 'aresevainaduvai@gmail.com',
            role: armobilesUser.role || 'admin'
          };
          updated = true;
        }
      } else {
        // Add new user if doesn't exist
        const maxId = Math.max(...users.map(u => parseInt(u.id || u.ID || 0)), 0);
        users.push({
          id: maxId + 1,
          username: 'armobiles',
          password: 'Admin@123',
          email: 'aresevainaduvai@gmail.com',
          role: 'admin'
        });
        updated = true;
      }
    }

    if (updated) {
      writeSheet(SHEETS.USERS, users);
      console.log('✅ Updated user credentials: armobiles / Admin@123');
      console.log('✅ Email updated: aresevainaduvai@gmail.com');
    }
  } catch (error) {
    console.error('Error updating user credentials:', error);
  }
};

// Find user by username and password
const findUserByCredentials = (users, username, password) => {
  return users.find(
    user => user.username === username && user.password === password
  );
};

// Update user password
const updateUserPassword = async (username, newPassword) => {
  try {
    const { readSheet, writeSheet, SHEETS } = require('./unifiedExcelHandler');
    const users = readSheet(SHEETS.USERS);
    
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
      return false;
    }

    users[userIndex].password = newPassword;
    writeSheet(SHEETS.USERS, users);
    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    return false;
  }
};

module.exports = {
  readExcelFile,
  createDefaultExcelFile,
  findUserByCredentials,
  updateUserPassword,
  updateExistingUserCredentials
};