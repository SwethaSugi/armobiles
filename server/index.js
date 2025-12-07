const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const repairRoutes = require('./routes/repairs');
const billingRoutes = require('./routes/billing');
const shopSettingsRoutes = require('./routes/shopSettings');
const othersRoutes = require('./routes/others');
const otherCategoriesRoutes = require('./routes/otherCategories');
const { createAllSampleData } = require('./utils/createSampleData');
const { migrateExistingFiles } = require('./utils/unifiedExcelHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Migrate existing separate Excel files to unified file
migrateExistingFiles();

// Sample data creation is disabled - data will only be saved when created through UI
// Uncomment the line below if you want to create sample data for testing
// createAllSampleData();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/shop-settings', shopSettingsRoutes);
app.use('/api/others', othersRoutes);
app.use('/api/other-categories', otherCategoriesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});