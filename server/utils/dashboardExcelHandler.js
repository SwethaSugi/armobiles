const { readSheet, SHEETS } = require('./unifiedExcelHandler');

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

// Get today's revenue
const getTodayRevenue = async () => {
    const today = getTodayDate();
    let total = 0;

    // Sales revenue
    const sales = readSheet(SHEETS.SALES);
    const todaySales = sales.filter(sale => {
        const saleDate = sale.date || sale.Date || sale.createdAt;
        return saleDate && saleDate.toString().startsWith(today);
    });
    total += todaySales.reduce((sum, sale) => {
        const amount = parseFloat(sale.amount || sale.Amount || sale.total || sale.Total || 0);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // Bills revenue
    const bills = readSheet(SHEETS.BILLS);
    const todayBills = bills.filter(bill => {
        const billDate = bill.date || bill.Date || bill.createdAt?.split('T')[0];
        return billDate && billDate.toString().startsWith(today);
    });
    total += todayBills.reduce((sum, bill) => {
        const amount = parseFloat(bill.total || bill.Total || 0);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // Others revenue
    const others = readSheet(SHEETS.OTHERS);
    const todayOthers = others.filter(other => {
        const otherDate = other.date || other.Date || other.createdAt?.split('T')[0];
        return otherDate && otherDate.toString().startsWith(today);
    });
    total += todayOthers.reduce((sum, other) => {
        const amount = parseFloat(other.amount || other.Amount || 0);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    return total;
};

// Get total revenue
const getTotalRevenue = async () => {
    let total = 0;

    // Sales revenue
    const sales = readSheet(SHEETS.SALES);
    total += sales.reduce((sum, sale) => {
        const amount = parseFloat(sale.amount || sale.Amount || sale.total || sale.Total || 0);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // Bills revenue
    const bills = readSheet(SHEETS.BILLS);
    total += bills.reduce((sum, bill) => {
        const amount = parseFloat(bill.total || bill.Total || 0);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    // Others revenue
    const others = readSheet(SHEETS.OTHERS);
    total += others.reduce((sum, other) => {
        const amount = parseFloat(other.amount || other.Amount || 0);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    return total;
};

// Get pending services count
const getPendingServicesCount = async () => {
    const services = readSheet(SHEETS.REPAIRS);

    return services.filter(service => {
        const status = (service.status || service.Status || '').toLowerCase();
        return status === 'pending' || status === 'in progress' || status === '';
    }).length;
};

// Get low stock alerts count (products with stock <= 5)
const getLowStockCount = async () => {
    const products = readSheet(SHEETS.PRODUCTS);

    return products.filter(product => {
        const stock = parseFloat(product.stock || product.Stock || product.quantity || product.Quantity || 0);
        return stock <= 5 && stock > 0;
    }).length;
};

// Get revenue chart data based on view type
const getRevenueChartData = async (viewType, startDate, endDate) => {
    const sales = readSheet(SHEETS.SALES);
    const bills = readSheet(SHEETS.BILLS);
    const others = readSheet(SHEETS.OTHERS);

    // Combine all revenue sources
    const allRevenue = [
        ...sales.map(s => ({
            date: s.date || s.Date || s.createdAt,
            amount: parseFloat(s.amount || s.Amount || s.total || s.Total || 0)
        })),
        ...bills.map(b => ({
            date: b.date || b.Date || b.createdAt?.split('T')[0],
            amount: parseFloat(b.total || b.Total || 0)
        })),
        ...others.map(o => ({
            date: o.date || o.Date || o.createdAt?.split('T')[0],
            amount: parseFloat(o.amount || o.Amount || 0)
        }))
    ];

    let labels = [];
    let data = [];

    const now = new Date();

    if (viewType === '7days') {
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayLabel = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

            const dayRevenue = allRevenue
                .filter(r => {
                    const revenueDate = r.date?.toString().split('T')[0] || r.date?.toString();
                    return revenueDate && revenueDate.startsWith(dateStr);
                })
                .reduce((sum, r) => sum + (isNaN(r.amount) ? 0 : r.amount), 0);

            labels.push(dayLabel);
            data.push(dayRevenue);
        }
    } else if (viewType === '30days') {
        // Last 30 days (grouped by week)
        for (let i = 4; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
            const weekEnd = new Date(now);
            weekEnd.setDate(weekEnd.getDate() - (i * 7));

            const weekLabel = `Week ${5 - i}`;

            const weekRevenue = allRevenue
                .filter(r => {
                    if (!r.date) return false;
                    const revenueDate = new Date(r.date);
                    return revenueDate >= weekStart && revenueDate <= weekEnd;
                })
                .reduce((sum, r) => sum + (isNaN(r.amount) ? 0 : r.amount), 0);

            labels.push(weekLabel);
            data.push(weekRevenue);
        }
    } else if (viewType === 'month') {
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
            const monthDate = new Date(now);
            monthDate.setMonth(monthDate.getMonth() - i);
            const monthLabel = monthDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

            const monthRevenue = allRevenue
                .filter(r => {
                    if (!r.date) return false;
                    const revenueDate = new Date(r.date);
                    return revenueDate.getMonth() === monthDate.getMonth() &&
                        revenueDate.getFullYear() === monthDate.getFullYear();
                })
                .reduce((sum, r) => sum + (isNaN(r.amount) ? 0 : r.amount), 0);

            labels.push(monthLabel);
            data.push(monthRevenue);
        }
    } else if (viewType === 'custom' && startDate && endDate) {
        // Custom date range
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 31) {
            // Show daily data
            for (let i = 0; i <= daysDiff; i++) {
                const date = new Date(start);
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                const dayLabel = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

                const dayRevenue = allRevenue
                    .filter(r => {
                        const revenueDate = r.date?.toString().split('T')[0] || r.date?.toString();
                        return revenueDate && revenueDate.startsWith(dateStr);
                    })
                    .reduce((sum, r) => sum + (isNaN(r.amount) ? 0 : r.amount), 0);

                labels.push(dayLabel);
                data.push(dayRevenue);
            }
        } else {
            // Show weekly data for longer ranges
            let currentStart = new Date(start);
            while (currentStart <= end) {
                const weekEnd = new Date(currentStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                if (weekEnd > end) weekEnd = new Date(end);

                const weekLabel = `${currentStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;

                const weekRevenue = allRevenue
                    .filter(r => {
                        if (!r.date) return false;
                        const revenueDate = new Date(r.date);
                        return revenueDate >= currentStart && revenueDate <= weekEnd;
                    })
                    .reduce((sum, r) => sum + (isNaN(r.amount) ? 0 : r.amount), 0);

                labels.push(weekLabel);
                data.push(weekRevenue);

                currentStart = new Date(weekEnd);
                currentStart.setDate(currentStart.getDate() + 1);
            }
        }
    }

    return { labels, data };
};

module.exports = {
    getTodayRevenue,
    getTotalRevenue,
    getPendingServicesCount,
    getLowStockCount,
    getRevenueChartData
};
