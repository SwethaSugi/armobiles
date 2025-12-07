const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'data.xlsx');

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const datasets = {
  Users: [
    {
      id: 1,
      username: 'armobiles',
      password: 'Admin@123',
      email: 'iyyappanmech.51@gmail.com',
      role: 'admin'
    }
  ],
  ShopSettings: [
    {
      shopName: 'AR MOBILES AND AR ESEVAI',
      shopPhone: '8144476803',
      shopEmail: 'aresevainaduvai@gmail.com',
      shopGstin: '33ABCDE1234F1Z5',
      shopAddress: 'NO.7, KAILASANATHAR KOVIL COMPLEX,\nTANA SAVADI, NADUVEERAPATTU 607102',
      defaultCgstRate: 9,
      defaultSgstRate: 9,
      defaultIgstRate: 18,
      shopLogoUrl: ''
    }
  ],
  Categories: [
    { id: 1, name: 'Smartphones', description: 'Android and iOS mobiles' },
    { id: 2, name: 'Accessories', description: 'Chargers, cables, earphones' },
    { id: 3, name: 'Repairs', description: 'Fixing services' },
    { id: 4, name: 'Services', description: 'Digital / financial services' },
    { id: 5, name: 'Batteries', description: 'OEM replacement batteries' }
  ],
  Products: [
    {
      id: 1,
      name: 'Redmi Note 13',
      category: 'Smartphones',
      quantity: 12,
      buyPrice: 14999,
      sellPrice: 17499,
      notes: '6GB RAM / 128GB storage',
      createdAt: '2025-11-01T10:15:00.000Z'
    },
    {
      id: 2,
      name: 'Samsung A35',
      category: 'Smartphones',
      quantity: 8,
      buyPrice: 24999,
      sellPrice: 27999,
      notes: 'Blue, dual SIM',
      createdAt: '2025-11-02T09:20:00.000Z'
    },
    {
      id: 3,
      name: '10000mAh Power Bank',
      category: 'Accessories',
      quantity: 18,
      buyPrice: 1200,
      sellPrice: 1799,
      notes: 'Type-C input with fast charge',
      createdAt: '2025-11-03T12:45:00.000Z'
    },
    {
      id: 4,
      name: 'Tempered Glass Pack',
      category: 'Accessories',
      quantity: 45,
      buyPrice: 35,
      sellPrice: 149,
      notes: 'Mixed sizes',
      createdAt: '2025-11-04T08:10:00.000Z'
    },
    {
      id: 5,
      name: 'iPhone Battery Replacement',
      category: 'Batteries',
      quantity: 6,
      buyPrice: 2800,
      sellPrice: 3800,
      notes: 'Original cells',
      createdAt: '2025-11-05T07:00:00.000Z'
    },
    {
      id: 6,
      name: 'Bluetooth Neckband',
      category: 'Accessories',
      quantity: 20,
      buyPrice: 650,
      sellPrice: 1199,
      notes: '12 hrs playback',
      createdAt: '2025-11-06T14:32:00.000Z'
    }
  ],
  Repairs: [
    {
      id: 1,
      customer: 'Suresh Kumar',
      device: 'Redmi Note 10',
      issue: 'Display replacement',
      status: 'completed',
      amount: 3200,
      date: '2025-11-05',
      notes: 'Delivered'
    },
    {
      id: 2,
      customer: 'Meena Devi',
      device: 'Samsung A21s',
      issue: 'Charging port issue',
      status: 'in progress',
      amount: 1200,
      date: '2025-11-06',
      notes: 'Awaiting spare'
    },
    {
      id: 3,
      customer: 'Dinesh Babu',
      device: 'Laptop',
      issue: 'Battery replacement',
      status: 'pending',
      amount: 4500,
      date: '2025-11-07',
      notes: 'Customer approval pending'
    },
    {
      id: 4,
      customer: 'Priya R',
      device: 'iPhone XR',
      issue: 'Speaker issue',
      status: 'completed',
      amount: 1800,
      date: '2025-11-08',
      notes: ''
    }
  ],
  Sales: [
    { date: '2025-11-04', type: 'product', amount: 24500, description: 'Mobile & accessories', customer: 'Walk-in' },
    { date: '2025-11-05', type: 'service', amount: 3200, description: 'Display replacement', customer: 'Suresh Kumar' },
    { date: '2025-11-05', type: 'product', amount: 1799, description: 'Power bank sale', customer: 'Anjali' },
    { date: '2025-11-06', type: 'other', amount: 850, description: 'DTH recharge', customer: 'Local customer' },
    { date: '2025-11-06', type: 'product', amount: 27999, description: 'Samsung A35', customer: 'Corporate order' },
    { date: '2025-11-07', type: 'service', amount: 4500, description: 'Laptop battery replacement', customer: 'Dinesh Babu' },
    { date: '2025-11-08', type: 'product', amount: 1199, description: 'Bluetooth neckband', customer: 'Online order' }
  ],
  Bills: [
    {
      id: 1,
      billNumber: 'BILL-000001',
      buyerName: 'Rajesh Kumar',
      buyerPhone: '9876543210',
      buyerEmail: 'rajesh@example.com',
      buyerAddress: '23 Gandhi Street, Chennai',
      items: JSON.stringify([
        { id: 1, type: 'product', name: 'Redmi Note 13', quantity: 1, price: 17499 },
        { id: 2, type: 'product', name: 'Tempered Glass Pack', quantity: 2, price: 149 }
      ]),
      gstEnabled: true,
      gstType: 'intra',
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 0,
      paymentMethod: 'UPI',
      notes: 'Includes screen guard installation',
      showSignature: true,
      subtotal: 17797,
      cgstAmount: 1601.73,
      sgstAmount: 1601.73,
      igstAmount: 0,
      total: 0,
      date: '2025-11-05',
      createdAt: '2025-11-05T11:15:00.000Z'
    },
    {
      id: 2,
      billNumber: 'BILL-000002',
      buyerName: 'Priya Sharma',
      buyerPhone: '9898989898',
      buyerEmail: 'priya@example.com',
      buyerAddress: 'Flat 12, Anna Nagar, Chennai',
      items: JSON.stringify([
        { id: 1, type: 'product', name: 'Samsung A35', quantity: 1, price: 27999 },
        { id: 2, type: 'service', name: 'Back cover installation', quantity: 1, price: 299 }
      ]),
      gstEnabled: false,
      gstType: 'intra',
      cgstRate: 0,
      sgstRate: 0,
      igstRate: 0,
      paymentMethod: 'Card',
      notes: '',
      showSignature: true,
      subtotal: 28298,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      total: 28298,
      date: '2025-11-06',
      createdAt: '2025-11-06T15:00:00.000Z'
    },
    {
      id: 3,
      billNumber: 'BILL-000003',
      buyerName: 'Vikram Singh',
      buyerPhone: '9123456780',
      buyerEmail: 'vikram@example.com',
      buyerAddress: '45 MG Road, Villupuram',
      items: JSON.stringify([
        { id: 1, type: 'service', name: 'iPhone Speaker Fix', quantity: 1, price: 1800 },
        { id: 2, type: 'product', name: 'Bluetooth Neckband', quantity: 1, price: 1199 }
      ]),
      gstEnabled: true,
      gstType: 'intra',
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 0,
      paymentMethod: 'Cash',
      notes: 'Service warranty 30 days',
      showSignature: false,
      subtotal: 2999,
      cgstAmount: 269.91,
      sgstAmount: 269.91,
      igstAmount: 0,
      total: 3538.82,
      date: '2025-11-08',
      createdAt: '2025-11-08T10:20:00.000Z'
    }
  ],
  Others: [
    {
      id: 1,
      category: 'Recharge',
      description: 'Airtel prepaid recharge',
      customerName: 'Karthik',
      amount: 599,
      notes: 'Annual plan',
      date: '2025-11-04',
      createdAt: '2025-11-04T09:00:00.000Z'
    },
    {
      id: 2,
      category: 'Bill Payment',
      description: 'TNEB electricity bill',
      customerName: 'Local customer',
      amount: 1450,
      notes: 'Service fee included',
      date: '2025-11-05',
      createdAt: '2025-11-05T08:30:00.000Z'
    },
    {
      id: 3,
      category: 'Money Transfer',
      description: 'IMPS transfer assistance',
      customerName: 'Ramya',
      amount: 25,
      notes: '',
      date: '2025-11-06',
      createdAt: '2025-11-06T17:45:00.000Z'
    },
    {
      id: 4,
      category: 'Xerox',
      description: 'Document copies',
      customerName: 'College student',
      amount: 60,
      notes: '30 pages',
      date: '2025-11-07',
      createdAt: '2025-11-07T13:10:00.000Z'
    }
  ],
  OtherCategories: [
    { name: 'Recharge', description: 'Mobile/DTH recharge services' },
    { name: 'Bill Payment', description: 'Utility and government bill payments' },
    { name: 'Money Transfer', description: 'Domestic money transfer help' },
    { name: 'Xerox', description: 'Photocopy and printouts' }
  ]
};

// Fix computed total for first bill (subtotal + cgst + sgst)
datasets.Bills[0].total = Number((datasets.Bills[0].subtotal + datasets.Bills[0].cgstAmount + datasets.Bills[0].sgstAmount).toFixed(2));

ensureDataDir();

const workbook = XLSX.utils.book_new();

Object.entries(datasets).forEach(([sheetName, rows]) => {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
});

XLSX.writeFile(workbook, DATA_FILE);
console.log(`✅ Created ${path.relative(process.cwd(), DATA_FILE)} with ${Object.keys(datasets).length} sheets.`);

