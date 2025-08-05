import React, { useState, useEffect } from 'react';
import { useOrderContext } from '../context/OrderContext';
import OrderQueue from './OrderQueue';
import CashierManagement from './CashierManagement';
import MenuManager from './MenuManager';
import TimeTracking from './TimeTracking';
import InventoryManagement from './InventoryManagement';
import AdvancedAnalytics from './AdvancedAnalytics';

interface AdminDashboardProps {
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    // Enhanced with Menu Management System
    const { processedOrders, refreshData, getPendingOrdersCount } = useOrderContext();
    const [activeTab, setActiveTab] = useState<'summary' | 'orders' | 'queue' | 'cashiers' | 'menu' | 'timetracking' | 'inventory' | 'analytics'>('summary');
    const [timePeriod, setTimePeriod] = useState<'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'last-7-days' | 'last-30-days' | 'custom'>('today');
    const [lastRefresh, setLastRefresh] = useState(new Date());

    // Cashier management state
    const [cashiers, setCashiers] = useState<Array<{id: string, username: string, password: string, createdAt: string}>>([]);
    const [showAddCashier, setShowAddCashier] = useState(false);
    const [newCashier, setNewCashier] = useState({username: '', password: ''});

    // Auto-refresh data every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refreshData();
            setLastRefresh(new Date());
        }, 5000);

        return () => clearInterval(interval);
    }, [refreshData]);

    // Excel export functionality
    const downloadReport = () => {
        const currentData = getSalesForPeriod(timePeriod);
        const comparisonData = getComparisonData(timePeriod);
        const chartData = getChartData(timePeriod);
        const dateRange = getDateRange(timePeriod);
        
        // Create CSV content (Excel can open CSV files)
        const csvContent = generateReportCSV(currentData, comparisonData, chartData, dateRange);
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `P-Town_Sales_Report_${timePeriod}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const generateReportCSV = (currentData: any, comparisonData: any, chartData: any, dateRange: any) => {
        const headers = [
            'P-Town Point of Sale - Sales Report',
            `Generated: ${new Date().toLocaleString()}`,
            `Period: ${dateRange.label}`,
            `Report Range: ${dateRange.start.toDateString()} - ${dateRange.end.toDateString()}`,
            '',
            'SUMMARY METRICS',
            'Metric,Current Period,Comparison Period,Change (%)',
            `Total Revenue,PHP ${currentData.total.toLocaleString()},PHP ${comparisonData.comparison.total.toLocaleString()},${comparisonData.salesChange}%`,
            `Total Orders,${currentData.count},${comparisonData.comparison.count},${comparisonData.ordersChange}%`,
            `Average Order Value,PHP ${currentData.count > 0 ? Math.round(currentData.total / currentData.count) : 0},PHP ${comparisonData.comparison.count > 0 ? Math.round(comparisonData.comparison.total / comparisonData.comparison.count) : 0},${Math.round(((currentData.count > 0 ? currentData.total / currentData.count : 0) - (comparisonData.comparison.count > 0 ? comparisonData.comparison.total / comparisonData.comparison.count : 0)) / (comparisonData.comparison.count > 0 ? comparisonData.comparison.total / comparisonData.comparison.count : 1) * 100) || 0}%`,
            '',
            'TOP SELLING ITEMS',
            'Item Name,Quantity Sold,Total Revenue'
        ];

        // Get actual menu items with prices from localStorage
        const menuItems = JSON.parse(localStorage.getItem('menuItems') || '[]');
        
        const topItemsData = chartData.topItems.map((item: any) => {
            // Find the actual menu item to get real price
            const menuItem = menuItems.find((menu: any) => menu.name === item.name);
            const itemPrice = menuItem ? menuItem.price : 50; // Default to 50 if not found
            const totalRevenue = item.value * itemPrice;
            return `${item.name},${item.value},PHP ${totalRevenue.toLocaleString()}`;
        });

        const salesTrendHeaders = [
            '',
            'SALES TREND DATA',
            'Date,Sales Amount,Order Count'
        ];

        const trendData = chartData.trendData.map((item: any) => {
            // Calculate estimated order count based on average order value
            const avgOrderValue = currentData.count > 0 ? currentData.total / currentData.count : 50;
            const estimatedOrders = avgOrderValue > 0 ? Math.round(item.value / avgOrderValue) : 0;
            return `${item.name},PHP ${item.value.toLocaleString()},${estimatedOrders}`;
        });

        const footerData = [
            '',
            'PERFORMANCE ANALYSIS',
            `Performance Status: ${comparisonData.salesChange >= 10 ? 'Excellent (Growing Fast)' : comparisonData.salesChange >= 0 ? 'Good (Growing)' : 'Needs Attention (Declining)'}`,
            `Revenue Growth: ${comparisonData.salesChange >= 0 ? '+' : ''}${comparisonData.salesChange}% vs ${comparisonData.comparisonLabel}`,
            `Order Growth: ${comparisonData.ordersChange >= 0 ? '+' : ''}${comparisonData.ordersChange}% vs ${comparisonData.comparisonLabel}`,
            '',
            '--- End of Report ---',
            'Generated by P-Town POS System'
        ];

        return [
            ...headers,
            ...topItemsData,
            ...salesTrendHeaders,
            ...trendData,
            ...footerData
        ].join('\n');
    };

    // Load cashiers on component mount
    useEffect(() => {
        const savedCashiers = localStorage.getItem('cashiers');
        if (savedCashiers) {
            setCashiers(JSON.parse(savedCashiers));
        }
    }, []);

    const saveCashiers = (newCashiers: Array<{id: string, username: string, password: string, createdAt: string}>) => {
        localStorage.setItem('cashiers', JSON.stringify(newCashiers));
        setCashiers(newCashiers);
    };

    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    const handleAddCashier = () => {
        if (!newCashier.username.trim() || !newCashier.password.trim()) {
            alert('Please fill in all fields');
            return;
        }

        // Check if username already exists
        if (cashiers.some(c => c.username.toLowerCase() === newCashier.username.trim().toLowerCase())) {
            alert('Username already exists. Please choose a different username.');
            return;
        }

        const cashier = {
            id: generateId(),
            username: newCashier.username.trim(),
            password: newCashier.password.trim(),
            createdAt: new Date().toISOString()
        };

        saveCashiers([...cashiers, cashier]);
        setNewCashier({username: '', password: ''});
        setShowAddCashier(false);
    };

    const handleDeleteCashier = (id: string) => {
        if (window.confirm('Are you sure you want to delete this cashier account?')) {
            saveCashiers(cashiers.filter(c => c.id !== id));
        }
    };

    // Load menu items from localStorage (synchronized with MenuManager)
    const [menuItems, setMenuItems] = useState([
        { id: 1, name: 'Burger', price: 150, available: true },
        { id: 2, name: 'Pizza', price: 300, available: true },
        { id: 3, name: 'Fries', price: 80, available: true },
        { id: 4, name: 'Soda', price: 50, available: true },
        { id: 5, name: 'Chicken', price: 120, available: true },
        { id: 6, name: 'Rice', price: 25, available: true },
        { id: 7, name: 'Salad', price: 90, available: true },
        { id: 8, name: 'Coffee', price: 60, available: true }
    ]);

    // Load menu items from localStorage on component mount
    useEffect(() => {
        const savedMenuItems = localStorage.getItem('menuItems');
        if (savedMenuItems) {
            setMenuItems(JSON.parse(savedMenuItems));
        }
    }, []);

    // Listen for menu items changes in localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            const savedMenuItems = localStorage.getItem('menuItems');
            if (savedMenuItems) {
                setMenuItems(JSON.parse(savedMenuItems));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Also check for changes every 2 seconds (for same-tab updates)
        const interval = setInterval(handleStorageChange, 2000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    const getItemName = (itemId: number) => {
        const item = menuItems.find(item => item.id === itemId);
        return item ? item.name : `Item ${itemId}`;
    };

    // Enhanced time period calculations with comparison features
    const getDateRange = (period: typeof timePeriod) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (period) {
            case 'today':
                return {
                    start: today,
                    end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                    label: 'Today'
                };
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);
                return {
                    start: yesterday,
                    end: today,
                    label: 'Yesterday'
                };
            case 'this-week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 7);
                return { 
                    start: weekStart, 
                    end: weekEnd,
                    label: 'This Week'
                };
            case 'last-week':
                const lastWeekStart = new Date(today);
                lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
                const lastWeekEnd = new Date(lastWeekStart);
                lastWeekEnd.setDate(lastWeekStart.getDate() + 7);
                return { 
                    start: lastWeekStart, 
                    end: lastWeekEnd,
                    label: 'Last Week'
                };
            case 'this-month':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                return { 
                    start: monthStart, 
                    end: monthEnd,
                    label: 'This Month'
                };
            case 'last-month':
                const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 1);
                return { 
                    start: lastMonthStart, 
                    end: lastMonthEnd,
                    label: 'Last Month'
                };
            case 'last-7-days':
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(today.getDate() - 7);
                return {
                    start: sevenDaysAgo,
                    end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                    label: 'Last 7 Days'
                };
            case 'last-30-days':
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 30);
                return {
                    start: thirtyDaysAgo,
                    end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                    label: 'Last 30 Days'
                };
            default:
                return {
                    start: today,
                    end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                    label: 'Today'
                };
        }
    };

    const getSalesForPeriod = (period: typeof timePeriod) => {
        const { start, end } = getDateRange(period);
        
        const filteredOrders = processedOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= start && orderDate < end;
        });

        // Only count completed/served orders for sales calculations
        const completedOrders = filteredOrders.filter(order => 
            order.status === 'completed' || order.status === 'served'
        );

        const total = completedOrders.reduce((sum, order) => {
            return sum + Object.entries(order.items).reduce((itemSum: number, [itemId, quantity]: [string, number]) => {
                const item = menuItems.find(item => item.id === Number(itemId));
                return itemSum + (item ? item.price * quantity : 0);
            }, 0);
        }, 0);

        return { count: completedOrders.length, total, orders: filteredOrders };
    };

    const getChartData = (period: typeof timePeriod) => {
        const { start, end } = getDateRange(period);
        
        const filteredOrders = processedOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= start && orderDate < end;
        });

        // Only count completed/served orders for sales trend calculations
        const completedOrders = filteredOrders.filter(order => 
            order.status === 'completed' || order.status === 'served'
        );

        // Sales trend data
        const salesByDate: { [key: string]: number } = {};
        completedOrders.forEach(order => {
            const dateKey = new Date(order.createdAt).toISOString().split('T')[0];
            if (!salesByDate[dateKey]) salesByDate[dateKey] = 0;
            
            const orderTotal = Object.entries(order.items).reduce((sum, [itemId, quantity]) => {
                const item = menuItems.find(item => item.id === Number(itemId));
                return sum + (item ? item.price * quantity : 0);
            }, 0);
            
            salesByDate[dateKey] += orderTotal;
        });

        const trendData = Object.entries(salesByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-7)
            .map(([date, sales]) => ({ 
                name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
                value: sales 
            }));

        // Top selling items (only from completed/served orders)
        const itemCounts: { [key: string]: number } = {};
        completedOrders.forEach(order => {
            Object.entries(order.items).forEach(([itemId, quantity]) => {
                const itemName = getItemName(Number(itemId));
                itemCounts[itemName] = (itemCounts[itemName] || 0) + quantity;
            });
        });

        const topItems = Object.entries(itemCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }));

        return { trendData, topItems };
    };

    // Daily Sales Comparison Functions
    const getDailySalesComparison = () => {
        const now = new Date();
        const salesByDate: { [key: string]: { sales: number; orders: number } } = {};
        
        // Get last 14 days of data
        for (let i = 13; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            salesByDate[dateKey] = { sales: 0, orders: 0 };
        }

        // Populate with actual order data (only completed/served orders)
        processedOrders.filter(order => 
            order.status === 'completed' || order.status === 'served'
        ).forEach(order => {
            const dateKey = new Date(order.createdAt).toISOString().split('T')[0];
            if (salesByDate[dateKey]) {
                const orderTotal = Object.entries(order.items).reduce((sum, [itemId, quantity]) => {
                    const item = menuItems.find(item => item.id === Number(itemId));
                    return sum + (item ? item.price * quantity : 0);
                }, 0);
                
                salesByDate[dateKey].sales += orderTotal;
                salesByDate[dateKey].orders += 1;
            }
        });

        const dailyData = Object.entries(salesByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, data]) => ({
                date,
                formattedDate: new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                }),
                sales: data.sales,
                orders: data.orders
            }));

        // Calculate day-over-day changes
        const dailyComparison = dailyData.map((day, index) => {
            const previousDay = index > 0 ? dailyData[index - 1] : null;
            const salesChange = previousDay 
                ? ((day.sales - previousDay.sales) / (previousDay.sales || 1)) * 100 
                : 0;
            const ordersChange = previousDay 
                ? ((day.orders - previousDay.orders) / (previousDay.orders || 1)) * 100 
                : 0;

            return {
                ...day,
                salesChange: Math.round(salesChange * 10) / 10,
                ordersChange: Math.round(ordersChange * 10) / 10,
                isToday: day.date === now.toISOString().split('T')[0],
                isYesterday: day.date === new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };
        });

        return dailyComparison;
    };

    const getWeekComparison = () => {
        const now = new Date();
        const currentWeekStart = new Date(now);
        currentWeekStart.setDate(now.getDate() - now.getDay());
        
        const lastWeekStart = new Date(currentWeekStart);
        lastWeekStart.setDate(currentWeekStart.getDate() - 7);

        const getCurrentWeekSales = () => {
            const weekEnd = new Date(currentWeekStart);
            weekEnd.setDate(currentWeekStart.getDate() + 7);
            
            return processedOrders
                .filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= currentWeekStart && orderDate < weekEnd && 
                           (order.status === 'completed' || order.status === 'served');
                })
                .reduce((sum, order) => {
                    return sum + Object.entries(order.items).reduce((itemSum, [itemId, quantity]) => {
                        const item = menuItems.find(item => item.id === Number(itemId));
                        return itemSum + (item ? item.price * quantity : 0);
                    }, 0);
                }, 0);
        };

        const getLastWeekSales = () => {
            const weekEnd = new Date(lastWeekStart);
            weekEnd.setDate(lastWeekStart.getDate() + 7);
            
            return processedOrders
                .filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= lastWeekStart && orderDate < weekEnd && 
                           (order.status === 'completed' || order.status === 'served');
                })
                .reduce((sum, order) => {
                    return sum + Object.entries(order.items).reduce((itemSum, [itemId, quantity]) => {
                        const item = menuItems.find(item => item.id === Number(itemId));
                        return itemSum + (item ? item.price * quantity : 0);
                    }, 0);
                }, 0);
        };

        const currentWeekSales = getCurrentWeekSales();
        const lastWeekSales = getLastWeekSales();
        const weekOverWeekChange = lastWeekSales > 0 
            ? ((currentWeekSales - lastWeekSales) / lastWeekSales) * 100 
            : 0;

        return {
            currentWeek: currentWeekSales,
            lastWeek: lastWeekSales,
            change: Math.round(weekOverWeekChange * 10) / 10
        };
    };

    // SVG Chart Components
    const BarChart = ({ data, title }: { data: { name: string; value: number }[], title: string }) => {
        // Handle empty data case
        if (!data || data.length === 0) {
            return (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '1.5rem',
                    borderRadius: '15px',
                    border: '1px solid rgba(226, 232, 240, 0.5)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    marginBottom: '1.5rem'
                }}>
                    <h3 style={{ color: '#1e293b', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600' }}>
                        {title}
                    </h3>
                    <div style={{
                        height: '150px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        fontSize: '1rem'
                    }}>
                        No data available
                    </div>
                </div>
            );
        }

        const maxValue = Math.max(...data.map(d => d.value), 1); // Ensure maxValue is at least 1
        
        return (
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '1.5rem',
                borderRadius: '15px',
                border: '1px solid rgba(226, 232, 240, 0.5)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                marginBottom: '1.5rem'
            }}>
                <h3 style={{ color: '#1e293b', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600' }}>
                    {title}
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {data.map((item, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ 
                                width: '120px', 
                                color: '#475569', 
                                fontSize: '0.9rem',
                                textAlign: 'right',
                                fontWeight: '500'
                            }}>
                                {item.name}
                            </div>
                            <div style={{ 
                                flex: 1, 
                                height: '25px', 
                                background: 'rgba(148, 163, 184, 0.1)',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${(item.value / maxValue) * 100}%`,
                                    background: `linear-gradient(90deg, 
                                        rgba(59, 130, 246, 0.8) 0%, 
                                        rgba(139, 92, 246, 0.6) 50%, 
                                        rgba(59, 130, 246, 0.4) 100%)`,
                                    borderRadius: '12px',
                                    transition: 'width 0.6s ease'
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    right: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#1e293b',
                                    fontSize: '0.8rem',
                                    fontWeight: '600'
                                }}>
                                    {item.value}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const LineChart = ({ data, title }: { data: { name: string; value: number }[], title: string }) => {
        // Handle empty data case
        if (!data || data.length === 0) {
            return (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '1.5rem',
                    borderRadius: '15px',
                    border: '1px solid rgba(226, 232, 240, 0.5)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    marginBottom: '1.5rem'
                }}>
                    <h3 style={{ color: '#1e293b', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600' }}>
                        {title}
                    </h3>
                    <div style={{
                        height: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        fontSize: '1rem'
                    }}>
                        No data available for the selected period
                    </div>
                </div>
            );
        }

        const maxValue = Math.max(...data.map(d => d.value), 1); // Ensure maxValue is at least 1
        const width = 400;
        const height = 200;
        const padding = 40;
        
        // Handle single data point case
        const points = data.map((item, index) => {
            const x = data.length === 1 
                ? width / 2 
                : padding + (index * (width - 2 * padding)) / (data.length - 1);
            const y = height - padding - ((item.value / maxValue) * (height - 2 * padding));
            return { x, y, value: item.value, name: item.name };
        });
        
        const pathData = points.map((point, index) => 
            `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
        ).join(' ');
        
        return (
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '1.5rem',
                borderRadius: '15px',
                border: '1px solid rgba(226, 232, 240, 0.5)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                marginBottom: '1.5rem'
            }}>
                <h3 style={{ color: '#1e293b', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600' }}>
                    {title}
                </h3>
                <svg width={width} height={height} style={{ overflow: 'visible' }}>
                    <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
                            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.6)" />
                            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.4)" />
                        </linearGradient>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
                        </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                        <line
                            key={ratio}
                            x1={padding}
                            y1={height - padding - ratio * (height - 2 * padding)}
                            x2={width - padding}
                            y2={height - padding - ratio * (height - 2 * padding)}
                            stroke="rgba(148, 163, 184, 0.2)"
                            strokeWidth="1"
                        />
                    ))}
                    
                    {/* Area under the line */}
                    <path
                        d={`${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
                        fill="url(#areaGradient)"
                    />
                    
                    {/* Main line */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    
                    {/* Data points */}
                    {points.map((point, index) => (
                        <g key={index}>
                            <circle
                                cx={point.x}
                                cy={point.y}
                                r="6"
                                fill="rgba(59, 130, 246, 0.9)"
                                stroke="white"
                                strokeWidth="2"
                            />
                            <text
                                x={point.x}
                                y={height - 10}
                                textAnchor="middle"
                                fontSize="11"
                                fill="#475569"
                                fontWeight="500"
                            >
                                {point.name}
                            </text>
                            <text
                                x={point.x}
                                y={point.y - 15}
                                textAnchor="middle"
                                fontSize="12"
                                fill="#1e293b"
                                fontWeight="600"
                            >
                                ₱{point.value}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>
        );
    };

    const PieChart = ({ data, title }: { data: { name: string; value: number }[], title: string }) => {
        // Handle empty data case
        if (!data || data.length === 0) {
            return (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '1.5rem',
                    borderRadius: '15px',
                    border: '1px solid rgba(226, 232, 240, 0.5)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    marginBottom: '1.5rem'
                }}>
                    <h3 style={{ color: '#1e293b', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600' }}>
                        {title}
                    </h3>
                    <div style={{
                        height: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        fontSize: '1rem'
                    }}>
                        No data available
                    </div>
                </div>
            );
        }

        const total = data.reduce((sum, item) => sum + item.value, 0);
        
        // Handle case where total is 0
        if (total === 0) {
            return (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '1.5rem',
                    borderRadius: '15px',
                    border: '1px solid rgba(226, 232, 240, 0.5)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    marginBottom: '1.5rem'
                }}>
                    <h3 style={{ color: '#1e293b', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600' }}>
                        {title}
                    </h3>
                    <div style={{
                        height: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        fontSize: '1rem'
                    }}>
                        No sales data available
                    </div>
                </div>
            );
        }

        const radius = 80;
        const centerX = 120;
        const centerY = 100;
        
        let currentAngle = 0;
        const slices = data.map(item => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 2 * Math.PI;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const x1 = centerX + radius * Math.cos(startAngle);
            const y1 = centerY + radius * Math.sin(startAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);
            
            const largeArcFlag = angle > Math.PI ? 1 : 0;
            const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            
            currentAngle += angle;
            
            return {
                ...item,
                pathData,
                percentage: percentage.toFixed(1),
                color: `hsl(${(data.indexOf(item) * 360) / data.length}, 70%, 60%)`
            };
        });
        
        return (
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '1.5rem',
                borderRadius: '15px',
                border: '1px solid rgba(226, 232, 240, 0.5)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                marginBottom: '1.5rem'
            }}>
                <h3 style={{ color: '#1e293b', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600' }}>
                    {title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <svg width={240} height={200}>
                        {slices.map((slice, index) => (
                            <path
                                key={index}
                                d={slice.pathData}
                                fill={slice.color}
                                stroke="white"
                                strokeWidth="2"
                                opacity="0.8"
                            />
                        ))}
                    </svg>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {slices.map((slice, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div
                                    style={{
                                        width: '12px',
                                        height: '12px',
                                        backgroundColor: slice.color,
                                        borderRadius: '2px'
                                    }}
                                />
                                <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                                    {slice.name} ({slice.percentage}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Daily Sales Comparison Component
    const DailySalesComparison = () => {
        const dailyData = getDailySalesComparison();
        const weekComparison = getWeekComparison();
        const todayData = dailyData.find(day => day.isToday) || { sales: 0, orders: 0, salesChange: 0, ordersChange: 0 };
        const yesterdayData = dailyData.find(day => day.isYesterday) || { sales: 0, orders: 0 };

        return (
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '1.5rem',
                borderRadius: '15px',
                border: '1px solid rgba(226, 232, 240, 0.5)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                marginBottom: '1.5rem'
            }}>
                <h3 style={{ color: '#1e293b', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '600' }}>
                    📈 Daily Sales Comparison (Last 14 Days)
                </h3>

                {/* Key Metrics */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                        padding: '1rem',
                        borderRadius: '10px',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        textAlign: 'center'
                    }}>
                        <div style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                            TODAY
                        </div>
                        <div style={{ color: '#1e293b', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                            ₱{todayData.sales.toLocaleString()}
                        </div>
                        <div style={{ 
                            color: todayData.salesChange >= 0 ? '#10b981' : '#ef4444', 
                            fontSize: '0.8rem', 
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem'
                        }}>
                            {todayData.salesChange >= 0 ? '↗' : '↘'} {Math.abs(todayData.salesChange)}%
                        </div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                        padding: '1rem',
                        borderRadius: '10px',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        textAlign: 'center'
                    }}>
                        <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                            YESTERDAY
                        </div>
                        <div style={{ color: '#1e293b', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                            ₱{yesterdayData.sales.toLocaleString()}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                            {yesterdayData.orders} orders
                        </div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                        padding: '1rem',
                        borderRadius: '10px',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        textAlign: 'center'
                    }}>
                        <div style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                            THIS WEEK
                        </div>
                        <div style={{ color: '#1e293b', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                            ₱{weekComparison.currentWeek.toLocaleString()}
                        </div>
                        <div style={{ 
                            color: weekComparison.change >= 0 ? '#10b981' : '#ef4444', 
                            fontSize: '0.8rem', 
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem'
                        }}>
                            {weekComparison.change >= 0 ? '↗' : '↘'} {Math.abs(weekComparison.change)}% vs last week
                        </div>
                    </div>

                    <div style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                        padding: '1rem',
                        borderRadius: '10px',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        textAlign: 'center'
                    }}>
                        <div style={{ color: '#8b5cf6', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                            AVG/DAY (14D)
                        </div>
                        <div style={{ color: '#1e293b', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                            ₱{Math.round(dailyData.reduce((sum, day) => sum + day.sales, 0) / dailyData.length).toLocaleString()}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                            {Math.round(dailyData.reduce((sum, day) => sum + day.orders, 0) / dailyData.length)} orders
                        </div>
                    </div>
                </div>

                {/* Daily Trend Chart */}
                <div style={{
                    background: 'rgba(248, 250, 252, 0.5)',
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(226, 232, 240, 0.3)'
                }}>
                    <h4 style={{ color: '#475569', fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                        14-Day Sales Trend
                    </h4>
                    
                    {dailyData.length > 0 ? (
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {dailyData.slice(-7).map((day, index) => {
                                const maxSales = Math.max(...dailyData.map(d => d.sales), 1);
                                const widthPercentage = (day.sales / maxSales) * 100;
                                
                                return (
                                    <div key={day.date} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '0.75rem',
                                        background: day.isToday ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.7)',
                                        borderRadius: '8px',
                                        border: day.isToday ? '2px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(226, 232, 240, 0.5)'
                                    }}>
                                        <div style={{ 
                                            width: '80px', 
                                            color: day.isToday ? '#3b82f6' : '#475569', 
                                            fontSize: '0.85rem',
                                            fontWeight: day.isToday ? '600' : '500'
                                        }}>
                                            {day.formattedDate}
                                        </div>
                                        
                                        <div style={{ 
                                            flex: 1, 
                                            height: '20px', 
                                            background: 'rgba(148, 163, 184, 0.2)',
                                            borderRadius: '10px',
                                            overflow: 'hidden',
                                            position: 'relative'
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${widthPercentage}%`,
                                                background: day.isToday 
                                                    ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.8) 0%, rgba(59, 130, 246, 0.6) 100%)'
                                                    : 'linear-gradient(90deg, rgba(16, 185, 129, 0.7) 0%, rgba(34, 197, 94, 0.5) 100%)',
                                                borderRadius: '10px',
                                                transition: 'width 0.6s ease'
                                            }} />
                                        </div>
                                        
                                        <div style={{ 
                                            width: '80px', 
                                            textAlign: 'right',
                                            color: '#1e293b', 
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                        }}>
                                            ₱{day.sales.toLocaleString()}
                                        </div>
                                        
                                        <div style={{ 
                                            width: '60px', 
                                            textAlign: 'right',
                                            color: '#64748b', 
                                            fontSize: '0.8rem'
                                        }}>
                                            {day.orders} orders
                                        </div>
                                        
                                        {index > 0 && (
                                            <div style={{ 
                                                width: '50px', 
                                                textAlign: 'right',
                                                color: day.salesChange >= 0 ? '#10b981' : '#ef4444', 
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}>
                                                {day.salesChange >= 0 ? '+' : ''}{day.salesChange}%
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{
                            height: '100px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748b',
                            fontSize: '0.9rem'
                        }}>
                            No sales data available for comparison
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Get comparison data for period analytics
    const getComparisonData = (currentPeriod: typeof timePeriod) => {
        const current = getSalesForPeriod(currentPeriod);
        
        // Determine comparison period
        let comparisonPeriod: typeof timePeriod;
        switch (currentPeriod) {
            case 'today':
                comparisonPeriod = 'yesterday';
                break;
            case 'this-week':
                comparisonPeriod = 'last-week';
                break;
            case 'this-month':
                comparisonPeriod = 'last-month';
                break;
            case 'yesterday':
                // Compare yesterday to 2 days ago (custom logic)
                comparisonPeriod = 'today'; // Fallback
                break;
            case 'last-7-days':
                // Compare to previous 7 days (custom logic needed)
                comparisonPeriod = 'today'; // Fallback
                break;
            case 'last-30-days':
                // Compare to previous 30 days (custom logic needed)
                comparisonPeriod = 'today'; // Fallback
                break;
            default:
                comparisonPeriod = 'yesterday';
        }
        
        const comparison = getSalesForPeriod(comparisonPeriod);
        
        // Calculate percentage change
        const salesChange = comparison.total > 0 
            ? ((current.total - comparison.total) / comparison.total) * 100 
            : current.total > 0 ? 100 : 0;
            
        const ordersChange = comparison.count > 0 
            ? ((current.count - comparison.count) / comparison.count) * 100 
            : current.count > 0 ? 100 : 0;

        return {
            current,
            comparison,
            salesChange: Math.round(salesChange * 10) / 10,
            ordersChange: Math.round(ordersChange * 10) / 10,
            currentLabel: getDateRange(currentPeriod).label,
            comparisonLabel: getDateRange(comparisonPeriod).label
        };
    };

    const todayData = getSalesForPeriod('today');
    const comparisonData = getComparisonData(timePeriod);
    const weekData = getSalesForPeriod('this-week');
    const monthData = getSalesForPeriod('this-month');
    const chartData = getChartData(timePeriod);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            padding: '1.5rem'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                padding: '2rem',
                border: '1px solid rgba(226, 232, 240, 0.5)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    paddingBottom: '1rem',
                    borderBottom: '2px solid rgba(226, 232, 240, 0.3)'
                }}>
                    <h1 style={{
                        color: '#1e293b',
                        fontSize: '2rem',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        P-Town Admin Dashboard
                    </h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ 
                            color: '#64748b', 
                            fontSize: '0.9rem',
                            background: 'rgba(148, 163, 184, 0.1)',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(148, 163, 184, 0.2)'
                        }}>
                            Last updated: {lastRefresh.toLocaleTimeString()}
                        </div>
                        <button
                            onClick={onLogout}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                            }}
                        >
                            🚪 Logout
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
                    padding: '0.5rem',
                    background: 'rgba(148, 163, 184, 0.05)',
                    borderRadius: '15px',
                    border: '1px solid rgba(148, 163, 184, 0.1)'
                }}>
                    <button
                        onClick={() => setActiveTab('summary')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: activeTab === 'summary' 
                                ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' 
                                : 'rgba(148, 163, 184, 0.1)',
                            color: activeTab === 'summary' ? 'white' : '#475569',
                            border: activeTab === 'summary' 
                                ? '2px solid rgba(59, 130, 246, 0.3)' 
                                : '2px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            boxShadow: activeTab === 'summary' 
                                ? '0 4px 15px rgba(59, 130, 246, 0.3)' 
                                : 'none'
                        }}
                    >
                        📊 Sales Summary
                    </button>
                    <button
                        onClick={() => setActiveTab('queue')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: activeTab === 'queue' 
                                ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' 
                                : 'rgba(148, 163, 184, 0.1)',
                            color: activeTab === 'queue' ? 'white' : '#475569',
                            border: activeTab === 'queue' 
                                ? '2px solid rgba(16, 185, 129, 0.3)' 
                                : '2px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            boxShadow: activeTab === 'queue' 
                                ? '0 4px 15px rgba(16, 185, 129, 0.3)' 
                                : 'none',
                            position: 'relative'
                        }}
                    >
                        📋 Order Queue
                        {getPendingOrdersCount() > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                borderRadius: '50%',
                                width: '22px',
                                height: '22px',
                                fontSize: '0.7rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                            }}>
                                {getPendingOrdersCount()}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: activeTab === 'orders' 
                                ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' 
                                : 'rgba(148, 163, 184, 0.1)',
                            color: activeTab === 'orders' ? 'white' : '#475569',
                            border: activeTab === 'orders' 
                                ? '2px solid rgba(245, 158, 11, 0.3)' 
                                : '2px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            boxShadow: activeTab === 'orders' 
                                ? '0 4px 15px rgba(245, 158, 11, 0.3)' 
                                : 'none'
                        }}
                    >
                        📋 Order History
                    </button>
                    <button
                        onClick={() => setActiveTab('cashiers')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: activeTab === 'cashiers' 
                                ? 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)' 
                                : 'rgba(148, 163, 184, 0.1)',
                            color: activeTab === 'cashiers' ? 'white' : '#475569',
                            border: activeTab === 'cashiers' 
                                ? '2px solid rgba(6, 182, 212, 0.3)' 
                                : '2px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            boxShadow: activeTab === 'cashiers' 
                                ? '0 4px 15px rgba(6, 182, 212, 0.3)' 
                                : 'none'
                        }}
                    >
                        👥 Cashier Management
                    </button>
                    <button
                        onClick={() => setActiveTab('menu')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: activeTab === 'menu' 
                                ? 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' 
                                : 'rgba(148, 163, 184, 0.1)',
                            color: activeTab === 'menu' ? 'white' : '#475569',
                            border: activeTab === 'menu' 
                                ? '2px solid rgba(139, 92, 246, 0.3)' 
                                : '2px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            boxShadow: activeTab === 'menu' 
                                ? '0 4px 15px rgba(139, 92, 246, 0.3)' 
                                : 'none'
                        }}
                    >
                        🍽️ Menu Management
                    </button>
                    <button
                        onClick={() => setActiveTab('timetracking')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: activeTab === 'timetracking' 
                                ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' 
                                : 'rgba(148, 163, 184, 0.1)',
                            color: activeTab === 'timetracking' ? 'white' : '#475569',
                            border: activeTab === 'timetracking' 
                                ? '2px solid rgba(245, 158, 11, 0.3)' 
                                : '2px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            boxShadow: activeTab === 'timetracking' 
                                ? '0 4px 15px rgba(245, 158, 11, 0.3)' 
                                : 'none'
                        }}
                    >
                        ⏰ Time Tracking
                    </button>
                    <button
                        onClick={() => setActiveTab('inventory')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: activeTab === 'inventory' 
                                ? 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)' 
                                : 'rgba(148, 163, 184, 0.1)',
                            color: activeTab === 'inventory' ? 'white' : '#475569',
                            border: activeTab === 'inventory' 
                                ? '2px solid rgba(22, 163, 74, 0.3)' 
                                : '2px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            boxShadow: activeTab === 'inventory' 
                                ? '0 4px 15px rgba(22, 163, 74, 0.3)' 
                                : 'none'
                        }}
                    >
                        📦 Inventory
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: activeTab === 'analytics' 
                                ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' 
                                : 'rgba(148, 163, 184, 0.1)',
                            color: activeTab === 'analytics' ? 'white' : '#475569',
                            border: activeTab === 'analytics' 
                                ? '2px solid rgba(220, 38, 38, 0.3)' 
                                : '2px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            boxShadow: activeTab === 'analytics' 
                                ? '0 4px 15px rgba(220, 38, 38, 0.3)' 
                                : 'none'
                        }}
                    >
                        📊 Analytics
                    </button>
                </div>

                {/* Content based on active tab */}
                {activeTab === 'summary' && (
                    <div>
                        {/* Enhanced Time Period Selector */}
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginBottom: '2rem',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '12px',
                                padding: '0.5rem',
                                border: '2px solid rgba(59, 130, 246, 0.2)',
                                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.1)'
                            }}>
                                <label style={{
                                    color: '#475569',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    marginRight: '1rem'
                                }}>
                                    📅 Time Period:
                                </label>
                                <select
                                    value={timePeriod}
                                    onChange={(e) => setTimePeriod(e.target.value as typeof timePeriod)}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        fontWeight: '600',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        minWidth: '200px'
                                    }}
                                >
                                    <optgroup label="📊 Current Periods" style={{ background: 'white', color: '#374151' }}>
                                        <option value="today">Today</option>
                                        <option value="this-week">This Week</option>
                                        <option value="this-month">This Month</option>
                                    </optgroup>
                                    <optgroup label="📈 Previous Periods" style={{ background: 'white', color: '#374151' }}>
                                        <option value="yesterday">Yesterday</option>
                                        <option value="last-week">Last Week</option>
                                        <option value="last-month">Last Month</option>
                                    </optgroup>
                                    <optgroup label="📆 Rolling Periods" style={{ background: 'white', color: '#374151' }}>
                                        <option value="last-7-days">Last 7 Days</option>
                                        <option value="last-30-days">Last 30 Days</option>
                                    </optgroup>
                                </select>
                            </div>
                            
                            {/* Period Comparison Info */}
                            <div style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                borderRadius: '8px',
                                padding: '0.5rem 1rem',
                                color: '#047857',
                                fontSize: '0.9rem',
                                fontWeight: '600'
                            }}>
                                📊 {getDateRange(timePeriod).label}
                            </div>

                            {/* Download Report Button */}
                            <button
                                onClick={downloadReport}
                                style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '0.75rem 1.5rem',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                                    transition: 'all 0.3s ease',
                                    outline: 'none'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                                }}
                            >
                                📊 Download Report
                            </button>
                        </div>

                        {/* Summary Cards */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '1.5rem',
                            marginBottom: '2rem'
                        }}>
                            {/* Current Period Card */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                                padding: '1.5rem',
                                borderRadius: '15px',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                textAlign: 'center'
                            }}>
                                <h3 style={{ color: '#3b82f6', fontSize: '1rem', marginBottom: '0.5rem' }}>
                                    {comparisonData.currentLabel} Sales
                                </h3>
                                <p style={{ color: '#1e293b', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
                                    ₱{comparisonData.current.total.toLocaleString()}
                                </p>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                                    {comparisonData.current.count} orders
                                </p>
                                {comparisonData.salesChange !== 0 && (
                                    <div style={{
                                        marginTop: '0.75rem',
                                        color: comparisonData.salesChange >= 0 ? '#10b981' : '#ef4444',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.25rem'
                                    }}>
                                        {comparisonData.salesChange >= 0 ? '📈' : '📉'} 
                                        {comparisonData.salesChange >= 0 ? '+' : ''}{comparisonData.salesChange}% 
                                        vs {comparisonData.comparisonLabel}
                                    </div>
                                )}
                            </div>
                            
                            {/* Weekly Overview */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                                padding: '1.5rem',
                                borderRadius: '15px',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                textAlign: 'center'
                            }}>
                                <h3 style={{ color: '#10b981', fontSize: '1rem', marginBottom: '0.5rem' }}>
                                    This Week Total
                                </h3>
                                <p style={{ color: '#1e293b', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
                                    ₱{weekData.total.toLocaleString()}
                                </p>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                                    {weekData.count} orders
                                </p>
                                <div style={{
                                    marginTop: '0.75rem',
                                    color: '#64748b',
                                    fontSize: '0.8rem'
                                }}>
                                    💡 Weekly performance
                                </div>
                            </div>
                            
                            {/* Monthly Overview */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                                padding: '1.5rem',
                                borderRadius: '15px',
                                border: '1px solid rgba(245, 158, 11, 0.2)',
                                textAlign: 'center'
                            }}>
                                <h3 style={{ color: '#f59e0b', fontSize: '1rem', marginBottom: '0.5rem' }}>
                                    This Month Total
                                </h3>
                                <p style={{ color: '#1e293b', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
                                    ₱{monthData.total.toLocaleString()}
                                </p>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                                    {monthData.count} orders
                                </p>
                                <div style={{
                                    marginTop: '0.75rem',
                                    color: '#64748b',
                                    fontSize: '0.8rem'
                                }}>
                                    📊 Monthly progress
                                </div>
                            </div>
                        </div>

                        {/* Period Insights Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                            padding: '1.5rem',
                            borderRadius: '15px',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            marginBottom: '2rem'
                        }}>
                            <h3 style={{
                                color: '#8b5cf6',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                🔍 Period Analysis: {comparisonData.currentLabel}
                            </h3>
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem'
                            }}>
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    padding: '1rem',
                                    borderRadius: '10px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>
                                        Revenue Comparison
                                    </div>
                                    <div style={{ 
                                        color: comparisonData.salesChange >= 0 ? '#10b981' : '#ef4444',
                                        fontSize: '1.3rem',
                                        fontWeight: 'bold',
                                        marginTop: '0.5rem'
                                    }}>
                                        {comparisonData.salesChange >= 0 ? '+' : ''}{comparisonData.salesChange}%
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                        vs {comparisonData.comparisonLabel}
                                    </div>
                                </div>

                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    padding: '1rem',
                                    borderRadius: '10px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>
                                        Orders Comparison
                                    </div>
                                    <div style={{ 
                                        color: comparisonData.ordersChange >= 0 ? '#10b981' : '#ef4444',
                                        fontSize: '1.3rem',
                                        fontWeight: 'bold',
                                        marginTop: '0.5rem'
                                    }}>
                                        {comparisonData.ordersChange >= 0 ? '+' : ''}{comparisonData.ordersChange}%
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                        vs {comparisonData.comparisonLabel}
                                    </div>
                                </div>

                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    padding: '1rem',
                                    borderRadius: '10px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>
                                        Average Order Value
                                    </div>
                                    <div style={{ 
                                        color: '#1e293b',
                                        fontSize: '1.3rem',
                                        fontWeight: 'bold',
                                        marginTop: '0.5rem'
                                    }}>
                                        ₱{comparisonData.current.count > 0 ? Math.round(comparisonData.current.total / comparisonData.current.count) : 0}
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                        per order
                                    </div>
                                </div>

                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.7)',
                                    padding: '1rem',
                                    borderRadius: '10px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>
                                        Performance Status
                                    </div>
                                    <div style={{ 
                                        color: comparisonData.salesChange >= 10 ? '#10b981' : comparisonData.salesChange >= 0 ? '#f59e0b' : '#ef4444',
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold',
                                        marginTop: '0.5rem'
                                    }}>
                                        {comparisonData.salesChange >= 10 ? '🚀 Excellent' : 
                                         comparisonData.salesChange >= 0 ? '📈 Good' : '📉 Needs Attention'}
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                        trending
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Daily Sales Comparison */}
                        <DailySalesComparison />

                        {/* Charts Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1.5rem',
                            marginBottom: '2rem'
                        }}>
                            <BarChart 
                                data={chartData.topItems} 
                                title="Top Selling Items" 
                            />
                            <LineChart 
                                data={chartData.trendData} 
                                title="Sales Trend" 
                            />
                        </div>

                        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                            <PieChart 
                                data={chartData.topItems} 
                                title="Top Items Distribution" 
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'queue' && (
                    <OrderQueue currentUser={{ id: 'admin', username: 'Administrator' }} />
                )}

                {/* Order Details Tab */}
                {activeTab === 'orders' && (
                    <div>
                        <h2 style={{ color: '#1e293b', marginBottom: '1.5rem' }}>Order History</h2>
                        
                        {processedOrders.length === 0 ? (
                            <div style={{
                                background: 'rgba(148, 163, 184, 0.1)',
                                padding: '2rem',
                                borderRadius: '15px',
                                textAlign: 'center',
                                border: '1px solid rgba(148, 163, 184, 0.2)'
                            }}>
                                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
                                    No processed orders yet.
                                </p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gap: '1rem'
                            }}>
                                {processedOrders
                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                    .map((order) => {
                                        const orderTotal = Object.entries(order.items).reduce((sum, [itemId, quantity]) => {
                                            const item = menuItems.find(item => item.id === Number(itemId));
                                            return sum + (item ? item.price * quantity : 0);
                                        }, 0);

                                        return (
                                            <div
                                                key={order.id}
                                                style={{
                                                    background: 'rgba(255, 255, 255, 0.95)',
                                                    padding: '1.5rem',
                                                    borderRadius: '15px',
                                                    border: '1px solid rgba(226, 232, 240, 0.5)',
                                                    backdropFilter: 'blur(10px)',
                                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    marginBottom: '1rem'
                                                }}>
                                                    <div>
                                                        <h3 style={{ 
                                                            color: '#1e293b', 
                                                            margin: '0 0 0.5rem 0',
                                                            fontSize: '1.1rem',
                                                            fontWeight: '600'
                                                        }}>
                                                            Order #{order.id}
                                                        </h3>
                                                        <p style={{ 
                                                            color: '#64748b', 
                                                            margin: 0,
                                                            fontSize: '0.9rem'
                                                        }}>
                                                            Processed: {new Date(order.createdAt).toLocaleString()}
                                                        </p>
                                                        {order.cashierName && (
                                                            <p style={{ 
                                                                color: '#64748b', 
                                                                margin: '0.25rem 0 0 0',
                                                                fontSize: '0.9rem'
                                                            }}>
                                                                Served by: {order.cashierName}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div style={{
                                                        background: order.status === 'cancelled' 
                                                            ? 'linear-gradient(135deg, #dc3545 0%, #f87171 100%)'
                                                            : order.status === 'pending'
                                                            ? 'linear-gradient(135deg, #ffc107 0%, #ffeb3b 100%)'
                                                            : order.status === 'preparing'
                                                            ? 'linear-gradient(135deg, #17a2b8 0%, #20c997 100%)'
                                                            : order.status === 'ready'
                                                            ? 'linear-gradient(135deg, #28a745 0%, #32cd32 100%)'
                                                            : order.status === 'served'
                                                            ? 'linear-gradient(135deg, #6c757d 0%, #adb5bd 100%)'
                                                            : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                                        color: 'white',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        {order.status === 'cancelled' 
                                                            ? 'Cancelled' 
                                                            : order.status === 'pending'
                                                            ? 'Pending'
                                                            : order.status === 'preparing'
                                                            ? 'Preparing'
                                                            : order.status === 'ready'
                                                            ? 'Ready'
                                                            : order.status === 'served'
                                                            ? 'Served'
                                                            : 'Completed'}
                                                    </div>
                                                </div>

                                                {/* Show cancellation info if order was cancelled */}
                                                {order.status === 'cancelled' && (
                                                    <div style={{
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                                        borderRadius: '8px',
                                                        padding: '1rem',
                                                        marginBottom: '1rem'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                            <span style={{ fontSize: '1.2rem' }}>❌</span>
                                                            <strong style={{ color: '#dc3545' }}>Order Cancelled</strong>
                                                        </div>
                                                        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                                            <div><strong>Reason:</strong> {order.cancellationReason || 'No reason provided'}</div>
                                                            {order.cancelledBy && (
                                                                <div><strong>Cancelled by:</strong> {order.cancelledBy}</div>
                                                            )}
                                                            {order.cancelledAt && (
                                                                <div><strong>Cancelled at:</strong> {new Date(order.cancelledAt).toLocaleString()}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div style={{
                                                    display: 'grid',
                                                    gap: '0.5rem',
                                                    marginBottom: '1rem'
                                                }}>
                                                    {Object.entries(order.items).map(([itemId, quantity]) => {
                                                        const item = menuItems.find(item => item.id === Number(itemId));
                                                        return (
                                                            <div
                                                                key={itemId}
                                                                style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    padding: '0.75rem',
                                                                    background: 'rgba(148, 163, 184, 0.05)',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid rgba(148, 163, 184, 0.1)'
                                                                }}
                                                            >
                                                                <span style={{ color: '#475569', fontWeight: '500' }}>
                                                                    {item ? item.name : `Item ${itemId}`}
                                                                </span>
                                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                                    <span style={{ color: '#64748b' }}>
                                                                        Qty: {quantity}
                                                                    </span>
                                                                    <span style={{ color: '#1e293b', fontWeight: '600' }}>
                                                                        ₱{item ? (item.price * quantity).toLocaleString() : 0}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    paddingTop: '1rem',
                                                    borderTop: '2px solid rgba(226, 232, 240, 0.3)'
                                                }}>
                                                    <span style={{
                                                        color: '#1e293b',
                                                        fontSize: '1.1rem',
                                                        fontWeight: '700'
                                                    }}>
                                                        Total: ₱{orderTotal.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                )}

                {/* Cashier Management Tab */}
                {activeTab === 'cashiers' && (
                    <CashierManagement />
                )}

                {/* Menu Management Tab */}
                {activeTab === 'menu' && (
                    <MenuManager />
                )}

                {/* Time Tracking Tab */}
                {activeTab === 'timetracking' && (
                    <TimeTracking 
                        currentUser={{ id: 'admin', username: 'Administrator' }}
                        isAdmin={true}
                    />
                )}

                {/* Inventory Management Tab */}
                {activeTab === 'inventory' && (
                    <InventoryManagement />
                )}

                {/* Advanced Analytics Tab */}
                {activeTab === 'analytics' && (
                    <AdvancedAnalytics />
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
