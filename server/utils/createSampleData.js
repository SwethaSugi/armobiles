const { writeSheet, readSheet, SHEETS, ensureDataDir } = require('./unifiedExcelHandler');

// Create sample sales data
const createSampleSalesData = () => {
  const existingSales = readSheet(SHEETS.SALES);
  
  if (existingSales.length > 0) {
    console.log('Sales data already exists, skipping creation');
    return;
  }

  const now = new Date();
  const sales = [];

  // Generate sample sales for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Generate 2-5 sales per day
    const salesCount = Math.floor(Math.random() * 4) + 2;
    for (let j = 0; j < salesCount; j++) {
      const types = ['product', 'service', 'xerox', 'other'];
      const type = types[Math.floor(Math.random() * types.length)];
      const amount = Math.floor(Math.random() * 5000) + 100; // 100 to 5100

      sales.push({
        date: dateStr,
        type: type,
        amount: amount,
        description: `Sample ${type} sale`,
        customer: `Customer ${Math.floor(Math.random() * 50) + 1}`
      });
    }
  }

  writeSheet(SHEETS.SALES, sales);
  console.log('Sample sales data created');
};

// Create sample products data
const createSampleProductsData = () => {
  const existingProducts = readSheet(SHEETS.PRODUCTS);
  
  if (existingProducts.length > 0) {
    console.log('Products data already exists, skipping creation');
    return;
  }

  const products = [
    { id: 1, name: 'Mobile Phone A', quantity: 15, buyPrice: 12000, sellPrice: 15000, category: 'mobile', notes: 'Latest model' },
    { id: 2, name: 'Mobile Phone B', quantity: 8, buyPrice: 16000, sellPrice: 20000, category: 'mobile', notes: 'Premium model' },
    { id: 3, name: 'Charger Type C', quantity: 3, buyPrice: 300, sellPrice: 500, category: 'Accessories', notes: 'Fast charging' },
    { id: 4, name: 'Screen Guard', quantity: 2, buyPrice: 100, sellPrice: 200, category: 'Accessories', notes: 'Tempered glass' },
    { id: 5, name: 'Earphones', quantity: 12, buyPrice: 800, sellPrice: 1500, category: 'Accessories', notes: 'Wireless' },
    { id: 6, name: 'Power Bank', quantity: 6, buyPrice: 1500, sellPrice: 2500, category: 'Accessories', notes: '10000mAh' },
    { id: 7, name: 'Mobile Case', quantity: 4, buyPrice: 150, sellPrice: 300, category: 'Accessories', notes: 'Shockproof' },
    { id: 8, name: 'USB Cable', quantity: 20, buyPrice: 80, sellPrice: 150, category: 'Accessories', notes: '1 meter length' }
  ];

  writeSheet(SHEETS.PRODUCTS, products);
  console.log('Sample products data created');
};

// Create sample services data
const createSampleServicesData = () => {
  const existingServices = readSheet(SHEETS.REPAIRS);
  
  if (existingServices.length > 0) {
    console.log('Services data already exists, skipping creation');
    return;
  }

  const services = [
    { id: 1, customer: 'Customer 1', device: 'Mobile Phone', issue: 'Screen Repair', status: 'completed', amount: 2000, date: new Date().toISOString().split('T')[0] },
    { id: 2, customer: 'Customer 2', device: 'Laptop', issue: 'Battery Replacement', status: 'pending', amount: 3500, date: new Date().toISOString().split('T')[0] },
    { id: 3, customer: 'Customer 3', device: 'Mobile Phone', issue: 'Software Update', status: 'in progress', amount: 500, date: new Date().toISOString().split('T')[0] },
    { id: 4, customer: 'Customer 4', device: 'Tablet', issue: 'Screen Replacement', status: 'pending', amount: 4500, date: new Date().toISOString().split('T')[0] },
    { id: 5, customer: 'Customer 5', device: 'Mobile Phone', issue: 'Charging Port Repair', status: 'completed', amount: 800, date: new Date().toISOString().split('T')[0] }
  ];

  writeSheet(SHEETS.REPAIRS, services);
  console.log('Sample services data created');
};

// Create sample bills data
const createSampleBillsData = (force = false) => {
  let existingBills = readSheet(SHEETS.BILLS);
  
  if (existingBills.length > 0 && !force) {
    console.log('Bills data already exists, skipping creation. Use force=true to add more.');
    return;
  }

  // If force and bills exist, start from the next ID
  let startId = 1;
  if (force && existingBills.length > 0) {
    const maxId = Math.max(...existingBills.map(b => {
      const id = b.id || b.ID;
      return typeof id === 'number' ? id : parseInt(id) || 0;
    }));
    startId = maxId + 1;
  }

  const now = new Date();
  const bills = force && existingBills.length > 0 ? [...existingBills] : [];

  // Generate sample bills for the last 15 days
  const customerNames = [
    'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Reddy', 'Vikram Singh',
    'Anjali Mehta', 'Rahul Gupta', 'Kavita Nair', 'Suresh Iyer', 'Divya Joshi',
    'Manoj Desai', 'Lakshmi Rao', 'Kiran Malhotra', 'Sunita Agarwal', 'Ravi Verma'
  ];

  const paymentMethods = ['Cash', 'UPI', 'Card', 'Net Banking', 'Cheque'];

  for (let i = 0; i < 15; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const createdAt = date.toISOString();

    // Generate 1-3 bills per day
    const billsCount = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < billsCount; j++) {
      const billId = bills.length + 1;
      const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
      const phone = `9${Math.floor(Math.random() * 9000000000) + 1000000000}`;
      const email = `${customerName.toLowerCase().replace(/\s+/g, '.')}@email.com`;
      
      // Generate items (1-4 items per bill)
      const itemCount = Math.floor(Math.random() * 4) + 1;
      const items = [];
      let subtotal = 0;

      for (let k = 0; k < itemCount; k++) {
        const itemNames = [
          'Mobile Phone', 'Screen Guard', 'Charger', 'Earphones', 'Power Bank',
          'Mobile Case', 'USB Cable', 'Phone Repair', 'Software Update', 'Accessories'
        ];
        const itemName = itemNames[Math.floor(Math.random() * itemNames.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = Math.floor(Math.random() * 5000) + 500;
        const itemTotal = quantity * price;
        subtotal += itemTotal;

        items.push({
          id: k + 1,
          type: 'product',
          name: itemName,
          quantity: quantity,
          price: price
        });
      }

      // GST calculation (50% chance of GST enabled)
      const gstEnabled = Math.random() > 0.5;
      const gstType = gstEnabled ? (Math.random() > 0.7 ? 'inter' : 'intra') : 'intra';
      let cgstAmount = 0;
      let sgstAmount = 0;
      let igstAmount = 0;
      let total = subtotal;

      if (gstEnabled) {
        if (gstType === 'intra') {
          const cgstRate = 9;
          const sgstRate = 9;
          cgstAmount = (subtotal * cgstRate) / 100;
          sgstAmount = (subtotal * sgstRate) / 100;
          total = subtotal + cgstAmount + sgstAmount;
        } else {
          const igstRate = 18;
          igstAmount = (subtotal * igstRate) / 100;
          total = subtotal + igstAmount;
        }
      }

      // Convert items array to JSON string for Excel storage
      const itemsJson = JSON.stringify(items);

      bills.push({
        id: startId + bills.length,
        billNumber: `BILL-${String(startId + bills.length).padStart(6, '0')}`,
        buyerName: customerName,
        buyerPhone: phone,
        buyerEmail: email,
        buyerAddress: `${Math.floor(Math.random() * 100) + 1} Main Street, City ${billId}`,
        items: itemsJson,
        gstEnabled: gstEnabled,
        gstType: gstType,
        cgstRate: gstEnabled && gstType === 'intra' ? 9 : 0,
        sgstRate: gstEnabled && gstType === 'intra' ? 9 : 0,
        igstRate: gstEnabled && gstType === 'inter' ? 18 : 0,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        notes: j === 0 ? 'Sample bill for testing' : '',
        showSignature: Math.random() > 0.5,
        subtotal: subtotal,
        cgstAmount: cgstAmount,
        sgstAmount: sgstAmount,
        igstAmount: igstAmount,
        total: total,
        date: dateStr,
        createdAt: createdAt
      });
    }
  }

  writeSheet(SHEETS.BILLS, bills);
  console.log(`Sample bills data created: ${bills.length} bills`);
};

// Create all sample data
const createAllSampleData = () => {
  try {
    ensureDataDir();
    createSampleSalesData();
    createSampleProductsData();
    createSampleServicesData();
    createSampleBillsData();
    console.log('All sample data created successfully in unified data.xlsx');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
};

module.exports = {
  createAllSampleData,
  createSampleSalesData,
  createSampleProductsData,
  createSampleServicesData,
  createSampleBillsData
};