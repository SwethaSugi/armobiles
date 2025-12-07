const { createSampleBillsData } = require('./utils/createSampleData');

console.log('Adding sample bills data...');
// Force add even if bills exist
createSampleBillsData(true);
console.log('✅ Sample bills data added successfully!');
console.log('You can now check the bills in the Billing List page.');
process.exit(0);