// Script to update user credentials in Excel file
const { updateExistingUserCredentials } = require('./utils/excelHandler');

async function main() {
  try {
    console.log('Updating user credentials...');
    await updateExistingUserCredentials();
    console.log('✅ User credentials updated successfully!');
    console.log('Username: armobiles');
    console.log('Password: Admin@123');
    console.log('Email: aresevainaduvai@gmail.com');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating credentials:', error);
    process.exit(1);
  }
}

main();