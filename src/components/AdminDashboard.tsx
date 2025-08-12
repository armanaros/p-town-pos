import React, { useState, useEffect } from 'react';
import { useOrderContext } from '../context/OrderContext';
import OrderQueue from './OrderQueue';
import CashierManagement from './CashierManagement';
import TimeTracking from './TimeTracking';
import MenuManagement from './MenuManagement';
// import { dataService } from '../utils/dataService'; // Temporarily disabled due to Firebase issues

interface AdminDashboardProps {
    onLogout: () => void;
    userRole?: 'admin' | 'manager' | 'waiter';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, userRole = 'admin' }) => {
    const { getSalesData, processedOrders, getTodaysSales, getTodaysOrderCount, refreshData, clearAllData, getPendingOrdersCount } = useOrderContext();
    // Set default tab based on user role
    const getDefaultTab = (role: string) => {
        switch (role) {
            case 'waiter': return 'queue';
            case 'manager': return 'summary';
            case 'admin': return 'summary';
            default: return 'summary';
        }
    };
    
    const [activeTab, setActiveTab] = useState<'summary' | 'orders' | 'queue' | 'operations' | 'menu'>(getDefaultTab(userRole));
    const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('day');
    const [lastRefresh, setLastRefresh] = useState(new Date());

    // Cashier management state
    const [cashiers, setCashiers] = useState<Array<{id: string, username: string, password: string, createdAt: string}>>([]);
    const [showAddCashier, setShowAddCashier] = useState(false);
    const [newCashier, setNewCashier] = useState({username: '', password: ''});

    // Payroll analytics state
    const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('7');


    // Auto-refresh data every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refreshData();
            setLastRefresh(new Date());
        }, 5000);

        return () => clearInterval(interval);
    }, [refreshData]);

    // Sync orders from Firebase - temporarily disabled
    useEffect(() => {
        // async function fetchOrders() {
        //     const orders = await dataService.getOrders();
        //     // If you use processedOrders from context, update context here
        //     // Otherwise, set to local state if needed
        //     // setOrders(orders); // If you want to use local state
        // }
        // fetchOrders();
    }, [lastRefresh]);

    // Sync cashiers from Firebase - temporarily disabled
    useEffect(() => {
        // async function fetchCashiers() {
        //     const cashiers = await dataService.getCashiers();
        //     setCashiers(cashiers);
        // }
        // fetchCashiers();
    }, [lastRefresh]);

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

    const currentSalesData = getSalesData();

    // Sample menu items for display
    const menuItems = [
        { id: 1, name: 'Burger', price: 150 },
        { id: 2, name: 'Pizza', price: 300 },
        { id: 3, name: 'Fries', price: 80 },
        { id: 4, name: 'Soda', price: 50 },
        { id: 5, name: 'Chicken', price: 120 },
        { id: 6, name: 'Rice', price: 25 },
        { id: 7, name: 'Salad', price: 90 },
        { id: 8, name: 'Coffee', price: 60 }
    ];

    const getItemName = (itemId: number) => {
        const item = menuItems.find(item => item.id === itemId);
        return item ? item.name : `Item ${itemId}`;
    };

    // Time period calculations
    const getDateRange = (period: 'day' | 'week' | 'month') => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (period) {
            case 'day':
                return {
                    start: today,
                    end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                };
            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 7);
                return { start: weekStart, end: weekEnd };
            case 'month':
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                return { start: monthStart, end: monthEnd };
            default:
                return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
        }
    };

    const getSalesForPeriod = (period: 'day' | 'week' | 'month') => {
        const { start, end } = getDateRange(period);
        
        const filteredOrders = processedOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= start && orderDate < end;
        });

        const total = filteredOrders.reduce((sum, order) => {
            return sum + Object.entries(order.items).reduce((itemSum: number, [itemId, quantity]: [string, number]) => {
                const item = menuItems.find(item => item.id === Number(itemId));
                return itemSum + (item ? item.price * quantity : 0);
            }, 0);
        }, 0);

        return { count: filteredOrders.length, total, orders: filteredOrders };
    };

    const getChartData = (period: 'day' | 'week' | 'month') => {
        const { start, end } = getDateRange(period);
        
        const filteredOrders = processedOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= start && orderDate < end;
        });

        // Sales trend data
        const salesByDate: { [key: string]: number } = {};
        filteredOrders.forEach(order => {
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

        // If no trend data, create a default empty point
        const finalTrendData = trendData.length > 0 ? trendData : [];

        // Top selling items
        const itemCounts: { [key: string]: number } = {};
        filteredOrders.forEach(order => {
            Object.entries(order.items).forEach(([itemId, quantity]) => {
                const itemName = getItemName(Number(itemId));
                itemCounts[itemName] = (itemCounts[itemName] || 0) + quantity;
            });
        });

        const topItems = Object.entries(itemCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }));

        return { trendData: finalTrendData, topItems };
    };

    // Excel Export Function
    const exportToExcel = (period: 'day' | 'week' | 'month') => {
        const salesData = getSalesForPeriod(period);
        const { orders } = salesData;
        
        // Create CSV content with proper UTF-8 BOM for Excel compatibility
        let csvContent = "\uFEFF"; // UTF-8 BOM
        
        // Add headers
        csvContent += "Order ID,Date,Time,Cashier,Item Name,Quantity,Unit Price,Item Total,Order Total\n";
        
        // Add data rows - one row per item instead of combining items
        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const dateStr = orderDate.toLocaleDateString('en-US');
            const timeStr = orderDate.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });
            const cashier = order.cashierName || 'Unknown';
            
            // Calculate order total first
            let orderTotal = 0;
            Object.entries(order.items).forEach(([itemId, quantity]) => {
                const item = menuItems.find(item => item.id === Number(itemId));
                const itemPrice = item ? item.price : 0;
                orderTotal += itemPrice * quantity;
            });
            
            // Create a row for each item in the order
            Object.entries(order.items).forEach(([itemId, quantity]) => {
                const item = menuItems.find(item => item.id === Number(itemId));
                const itemName = item ? item.name : `Item ${itemId}`;
                const itemPrice = item ? item.price : 0;
                const itemTotal = itemPrice * quantity;
                
                // Create row with proper escaping and formatting
                const row = [
                    `"${order.id}"`,
                    `"${dateStr}"`,
                    `"${timeStr}"`,
                    `"${cashier}"`,
                    `"${itemName}"`,
                    quantity,
                    itemPrice,
                    itemTotal,
                    orderTotal
                ].join(',');
                
                csvContent += row + "\n";
            });
        });
        
        // Add summary section
        csvContent += "\n";
        csvContent += "SUMMARY\n";
        csvContent += `Total Orders,${salesData.count}\n`;
        csvContent += `Total Sales,${salesData.total}\n`;
        csvContent += `Period,${period === 'day' ? 'Today' : period === 'week' ? 'This Week' : 'This Month'}\n`;
        csvContent += `Export Date,"${new Date().toLocaleString('en-US')}"\n`;
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `P-Town_Sales_${period}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Show success message
        alert(`Sales data exported successfully!\nFile: P-Town_Sales_${period}_${new Date().toISOString().split('T')[0]}.csv\nFormat: One row per item for better Excel compatibility`);
    };

    // Payroll Export Function
    const exportPayrollToExcel = () => {
        // Sample payroll data - in a real app, this would come from your time tracking system
        const employees = [
            { id: 'john_doe', name: 'John Doe', hourlyRate: 150, position: 'Cashier' },
            { id: 'jane_smith', name: 'Jane Smith', hourlyRate: 180, position: 'Senior Cashier' },
            { id: 'mike_johnson', name: 'Mike Johnson', hourlyRate: 200, position: 'Shift Supervisor' },
            { id: 'sarah_wilson', name: 'Sarah Wilson', hourlyRate: 160, position: 'Cashier' }
        ];

        // Sample time tracking data for the selected period
        const timeData = [
            { employeeId: 'john_doe', date: '2024-01-08', clockIn: '09:00', clockOut: '17:00', breakTime: 60, hoursWorked: 8.0 },
            { employeeId: 'john_doe', date: '2024-01-09', clockIn: '09:00', clockOut: '17:00', breakTime: 60, hoursWorked: 8.0 },
            { employeeId: 'john_doe', date: '2024-01-10', clockIn: '09:00', clockOut: '16:00', breakTime: 60, hoursWorked: 7.0 },
            { employeeId: 'jane_smith', date: '2024-01-08', clockIn: '08:30', clockOut: '17:30', breakTime: 60, hoursWorked: 8.5 },
            { employeeId: 'jane_smith', date: '2024-01-09', clockIn: '08:30', clockOut: '17:30', breakTime: 60, hoursWorked: 8.5 },
            { employeeId: 'mike_johnson', date: '2024-01-08', clockIn: '08:00', clockOut: '18:00', breakTime: 60, hoursWorked: 9.0 },
            { employeeId: 'mike_johnson', date: '2024-01-09', clockIn: '08:00', clockOut: '18:00', breakTime: 60, hoursWorked: 9.0 },
            { employeeId: 'sarah_wilson', date: '2024-01-08', clockIn: '10:00', clockOut: '18:00', breakTime: 60, hoursWorked: 7.0 },
            { employeeId: 'sarah_wilson', date: '2024-01-09', clockIn: '10:00', clockOut: '18:00', breakTime: 60, hoursWorked: 7.0 }
        ];

        // Filter data based on selected employee
        let filteredData = timeData;
        if (selectedEmployee !== 'all') {
            filteredData = timeData.filter(record => record.employeeId === selectedEmployee);
        }

        // Create CSV content with proper UTF-8 BOM for Excel compatibility
        let csvContent = "\uFEFF"; // UTF-8 BOM
        
        // Add company header
        csvContent += "P-TOWN RESTAURANT PAYROLL REPORT\n";
        csvContent += `Pay Period: ${selectedPeriod} Days\n`;
        csvContent += `Report Generated: ${new Date().toLocaleString('en-US')}\n`;
        csvContent += `Employee Filter: ${selectedEmployee === 'all' ? 'All Employees' : employees.find(e => e.id === selectedEmployee)?.name || 'Unknown'}\n`;
        csvContent += "\n";
        
        // Add detailed time records header
        csvContent += "DETAILED TIME RECORDS\n";
        csvContent += "Employee Name,Position,Date,Clock In,Clock Out,Break Time (min),Hours Worked,Hourly Rate,Daily Earnings\n";
        
        let totalHours = 0;
        let totalEarnings = 0;
        
        // Add detailed records
        filteredData.forEach(record => {
            const employee = employees.find(e => e.id === record.employeeId);
            if (employee) {
                const dailyEarnings = record.hoursWorked * employee.hourlyRate;
                totalHours += record.hoursWorked;
                totalEarnings += dailyEarnings;
                
                const row = [
                    `"${employee.name}"`,
                    `"${employee.position}"`,
                    `"${record.date}"`,
                    `"${record.clockIn}"`,
                    `"${record.clockOut}"`,
                    record.breakTime,
                    record.hoursWorked.toFixed(1),
                    `₱${employee.hourlyRate}`,
                    `₱${dailyEarnings.toFixed(2)}`
                ].join(',');
                
                csvContent += row + "\n";
            }
        });
        
        // Add summary section
        csvContent += "\n";
        csvContent += "PAYROLL SUMMARY\n";
        csvContent += "Employee Name,Position,Total Hours,Hourly Rate,Gross Pay,Deductions,Net Pay\n";
        
        // Group by employee for summary
        const employeeSummary: { [key: string]: { hours: number; earnings: number } } = {};
        filteredData.forEach(record => {
            if (!employeeSummary[record.employeeId]) {
                employeeSummary[record.employeeId] = { hours: 0, earnings: 0 };
            }
            const employee = employees.find(e => e.id === record.employeeId);
            if (employee) {
                employeeSummary[record.employeeId].hours += record.hoursWorked;
                employeeSummary[record.employeeId].earnings += record.hoursWorked * employee.hourlyRate;
            }
        });
        
        Object.entries(employeeSummary).forEach(([employeeId, summary]) => {
            const employee = employees.find(e => e.id === employeeId);
            if (employee) {
                const grossPay = summary.earnings;
                const deductions = grossPay * 0.1; // 10% deductions (taxes, etc.)
                const netPay = grossPay - deductions;
                
                const summaryRow = [
                    `"${employee.name}"`,
                    `"${employee.position}"`,
                    summary.hours.toFixed(1),
                    `₱${employee.hourlyRate}`,
                    `₱${grossPay.toFixed(2)}`,
                    `₱${deductions.toFixed(2)}`,
                    `₱${netPay.toFixed(2)}`
                ].join(',');
                
                csvContent += summaryRow + "\n";
            }
        });
        
        // Add totals
        csvContent += "\n";
        csvContent += "REPORT TOTALS\n";
        csvContent += `Total Hours Worked,${totalHours.toFixed(1)}\n`;
        csvContent += `Total Gross Pay,₱${totalEarnings.toFixed(2)}\n`;
        csvContent += `Total Deductions,₱${(totalEarnings * 0.1).toFixed(2)}\n`;
        csvContent += `Total Net Pay,₱${(totalEarnings * 0.9).toFixed(2)}\n`;
        csvContent += `Number of Employees,${Object.keys(employeeSummary).length}\n`;
        
        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        
        const employeeFilter = selectedEmployee === 'all' ? 'All' : employees.find(e => e.id === selectedEmployee)?.name?.replace(/\s+/g, '_') || 'Unknown';
        link.setAttribute("download", `P-Town_Payroll_${employeeFilter}_${selectedPeriod}Days_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Show success message
        alert(`Payroll data exported successfully!\nFile: P-Town_Payroll_${employeeFilter}_${selectedPeriod}Days_${new Date().toISOString().split('T')[0]}.csv\nFormat: Professional payroll report with detailed time records and summary`);
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

    const dayData = getSalesForPeriod('day');
    const weekData = getSalesForPeriod('week');
    const monthData = getSalesForPeriod('month');
    const chartData = getChartData(timePeriod);

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all sales, orders, and menu data? This action cannot be undone.')) {
            if (window.prompt('Type CLEAR to confirm data deletion:') === 'CLEAR') {
                clearAllData();
                alert('All data has been cleared.');
            } else {
                alert('Data clearing cancelled.');
            }
        }
    };

    return (
        <div className="admin-dashboard" style={{
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
                <div className="admin-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    paddingBottom: '1rem',
                    borderBottom: '2px solid rgba(226, 232, 240, 0.3)'
                }}>
                    <div>
                        <h1 style={{
                            color: '#1e293b',
                            fontSize: '2rem',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: 0
                        }}>
                            P-Town {userRole === 'admin' ? 'Admin' : userRole === 'manager' ? 'Manager' : 'Waiter'} Dashboard
                        </h1>
                        {/* Role Badge */}
                        <div style={{
                            display: 'inline-block',
                            marginTop: '0.5rem',
                            padding: '0.25rem 0.75rem',
                            background: userRole === 'admin'
                                ? 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
                                : userRole === 'manager'
                                ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
                                : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {userRole === 'admin' ? '👑 Administrator' : userRole === 'manager' ? '👔 Manager' : '👤 Waiter'}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <button
                            onClick={onLogout}
                            className="logout-button"
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
                            <span className="mobile-hidden">🚪 Logout</span>
                            <span className="mobile-only">🚪</span>
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="admin-tabs" style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
                    padding: '0.5rem',
                    background: 'rgba(148, 163, 184, 0.05)',
                    borderRadius: '15px',
                    border: '1px solid rgba(148, 163, 184, 0.1)'
                }}>
                    {/* Sales Summary - Available to all roles */}
                    {(userRole === 'admin' || userRole === 'manager' || userRole === 'waiter') && (
                        <button
                            onClick={() => setActiveTab('summary')}
                            className="admin-tab"
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
                            <span className="mobile-hidden">📊 Sales Summary</span>
                            <span className="mobile-only">📊 Sales</span>
                        </button>
                    )}
                    
                    {/* Operation Management - Admin only */}
                    {userRole === 'admin' && (
                        <button
                            onClick={() => setActiveTab('operations')}
                            className="admin-tab"
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: activeTab === 'operations'
                                    ? 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)'
                                    : 'rgba(148, 163, 184, 0.1)',
                                color: activeTab === 'operations' ? 'white' : '#475569',
                                border: activeTab === 'operations'
                                    ? '2px solid rgba(6, 182, 212, 0.3)'
                                    : '2px solid rgba(148, 163, 184, 0.2)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                boxShadow: activeTab === 'operations'
                                    ? '0 4px 15px rgba(6, 182, 212, 0.3)'
                                    : 'none'
                            }}
                        >
                            <span className="mobile-hidden">⚙️ Operation Management</span>
                            <span className="mobile-only">⚙️ Ops</span>
                        </button>
                    )}
                    
                    {/* Order Queue - Admin, Manager, and Waiter */}
                    {(userRole === 'admin' || userRole === 'manager' || userRole === 'waiter') && (
                        <button
                            onClick={() => setActiveTab('queue')}
                            className="admin-tab"
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
                            <span className="mobile-hidden">📋 Order Queue</span>
                            <span className="mobile-only">📋 Queue</span>
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
                    )}
                    
                    {/* Order History - Admin and Manager only */}
                    {(userRole === 'admin' || userRole === 'manager') && (
                        <button
                            onClick={() => setActiveTab('orders')}
                            className="admin-tab"
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
                            <span className="mobile-hidden">📋 Order History</span>
                            <span className="mobile-only">📋 Orders</span>
                        </button>
                    )}
                    
                    {/* Menu Management - Admin and Manager only */}
                    {(userRole === 'admin' || userRole === 'manager') && (
                        <button
                            onClick={() => setActiveTab('menu')}
                            className="admin-tab"
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
                            <span className="mobile-hidden">🍽️ Menu Management</span>
                            <span className="mobile-only">🍽️ Menu</span>
                        </button>
                    )}
                </div>

                {/* Content based on active tab */}
                {activeTab === 'summary' && (
                    <div>
                        {/* Time Period Selector and Export Button */}
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginBottom: '2rem',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                        }}>
                            {/* Time Period Dropdown */}
                            <div style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <label style={{
                                    color: '#475569',
                                    fontSize: '0.95rem',
                                    fontWeight: '600'
                                }}>
                                    Period:
                                </label>
                                <select
                                    value={timePeriod}
                                    onChange={(e) => setTimePeriod(e.target.value as 'day' | 'week' | 'month')}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                                        color: 'white',
                                        border: '2px solid rgba(59, 130, 246, 0.3)',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        fontSize: '0.95rem',
                                        fontWeight: '600',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                                        minWidth: '140px',
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none',
                                        appearance: 'none',
                                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 12px center',
                                        backgroundSize: '16px',
                                        paddingRight: '40px',
                                        textAlign: 'left',
                                        textAlignLast: 'left'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                                    }}
                                >
                                    <option value="day" style={{
                                        background: '#1e293b',
                                        color: '#ffffff',
                                        padding: '0.5rem'
                                    }}>
                                        1 Day
                                    </option>
                                    <option value="week" style={{
                                        background: '#1e293b',
                                        color: '#ffffff',
                                        padding: '0.5rem'
                                    }}>
                                        1 Week
                                    </option>
                                    <option value="month" style={{
                                        background: '#1e293b',
                                        color: '#ffffff',
                                        padding: '0.5rem'
                                    }}>
                                        1 Month
                                    </option>
                                </select>
                            </div>
                            
                            {/* Excel Export Button */}
                            <button
                                onClick={() => exportToExcel(timePeriod)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                    color: 'white',
                                    border: '2px solid rgba(16, 185, 129, 0.3)',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                                }}
                            >
                                <span>📊</span>
                                <span className="mobile-hidden">Export to Excel</span>
                                <span className="mobile-only">Excel</span>
                            </button>
                        </div>

                        {/* Summary Cards */}
                        <div className="stats-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '1.5rem',
                            marginBottom: '2rem'
                        }}>
                            <div className="stat-card" style={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                                padding: '1.5rem',
                                borderRadius: '15px',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                textAlign: 'center'
                            }}>
                                <h3 style={{ color: '#3b82f6', fontSize: '1rem', marginBottom: '0.5rem' }}>
                                    Today's Sales
                                </h3>
                                <p className="stat-value" style={{ color: '#1e293b', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
                                    ₱{dayData.total.toLocaleString()}
                                </p>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                                    {dayData.count} orders
                                </p>
                            </div>
                            
                            <div className="stat-card" style={{
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                                padding: '1.5rem',
                                borderRadius: '15px',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                textAlign: 'center'
                            }}>
                                <h3 style={{ color: '#10b981', fontSize: '1rem', marginBottom: '0.5rem' }}>
                                    Weekly Sales
                                </h3>
                                <p className="stat-value" style={{ color: '#1e293b', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
                                    ₱{weekData.total.toLocaleString()}
                                </p>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                                    {weekData.count} orders
                                </p>
                            </div>
                            
                            <div className="stat-card" style={{
                                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                                padding: '1.5rem',
                                borderRadius: '15px',
                                border: '1px solid rgba(245, 158, 11, 0.2)',
                                textAlign: 'center'
                            }}>
                                <h3 style={{ color: '#f59e0b', fontSize: '1rem', marginBottom: '0.5rem' }}>
                                    Monthly Sales
                                </h3>
                                <p className="stat-value" style={{ color: '#1e293b', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
                                    ₱{monthData.total.toLocaleString()}
                                </p>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                                    {monthData.count} orders
                                </p>
                            </div>
                        </div>

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
                    <OrderQueue
                        currentUser={{ id: 'admin', username: 'Administrator' }}
                        userRole={userRole}
                    />
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
                            <div className="table-container" style={{
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
                                                        background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                                        color: 'white',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        Served
                                                    </div>
                                                </div>
                                                
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

                {/* Operational Management Tab */}
                {activeTab === 'operations' && (
                    <div>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            padding: '2rem',
                            borderRadius: '15px',
                            border: '1px solid rgba(226, 232, 240, 0.5)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                            marginBottom: '2rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '2rem',
                                paddingBottom: '1rem',
                                borderBottom: '2px solid rgba(226, 232, 240, 0.3)'
                            }}>
                                <h2 style={{
                                    color: '#1e293b',
                                    fontSize: '1.8rem',
                                    fontWeight: '700',
                                    margin: 0,
                                    background: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    ⚙️ Operation Management
                                </h2>
                                <div style={{
                                    color: '#64748b',
                                    fontSize: '0.9rem',
                                    background: 'rgba(6, 182, 212, 0.1)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(6, 182, 212, 0.2)'
                                }}>
                                    Staff & Time Management
                                </div>
                            </div>

                            {/* Staff Management Section */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{
                                    color: '#1e293b',
                                    fontSize: '1.3rem',
                                    fontWeight: '600',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    👥 Staff Management
                                </h3>
                                <CashierManagement />
                            </div>

                            {/* Time Tracking Analytics Section */}
                            <div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '1rem',
                                    flexWrap: 'wrap',
                                    gap: '1rem'
                                }}>
                                    <h3 style={{
                                        color: '#1e293b',
                                        fontSize: '1.3rem',
                                        fontWeight: '600',
                                        margin: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        ⏰ Time Tracking Analytics
                                    </h3>
                                    
                                    {/* Employee and Payroll Selectors */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        flexWrap: 'wrap'
                                    }}>
                                        {/* Employee Selector */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            background: 'rgba(139, 92, 246, 0.05)',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(139, 92, 246, 0.1)'
                                        }}>
                                            <label style={{
                                                color: '#475569',
                                                fontSize: '0.9rem',
                                                fontWeight: '600'
                                            }}>
                                                👤 Employee:
                                            </label>
                                            <select
                                                value={selectedEmployee}
                                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                                                    color: 'white',
                                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)',
                                                    minWidth: '140px',
                                                    WebkitAppearance: 'none',
                                                    MozAppearance: 'none',
                                                    appearance: 'none',
                                                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'right 8px center',
                                                    backgroundSize: '12px',
                                                    paddingRight: '30px'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.2)';
                                                }}
                                            >
                                                <option value="all" style={{ background: '#1e293b', color: '#ffffff' }}>All Employees</option>
                                                <option value="john_doe" style={{ background: '#1e293b', color: '#ffffff' }}>John Doe</option>
                                                <option value="jane_smith" style={{ background: '#1e293b', color: '#ffffff' }}>Jane Smith</option>
                                                <option value="mike_johnson" style={{ background: '#1e293b', color: '#ffffff' }}>Mike Johnson</option>
                                                <option value="sarah_wilson" style={{ background: '#1e293b', color: '#ffffff' }}>Sarah Wilson</option>
                                            </select>
                                        </div>

                                        {/* Payroll Date Range Selector */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            background: 'rgba(6, 182, 212, 0.05)',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(6, 182, 212, 0.1)'
                                        }}>
                                            <label style={{
                                                color: '#475569',
                                                fontSize: '0.9rem',
                                                fontWeight: '600'
                                            }}>
                                                📅 Period:
                                            </label>
                                            <select
                                                value={selectedPeriod}
                                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
                                                    color: 'white',
                                                    border: '1px solid rgba(6, 182, 212, 0.3)',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 2px 8px rgba(6, 182, 212, 0.2)',
                                                    minWidth: '120px',
                                                    WebkitAppearance: 'none',
                                                    MozAppearance: 'none',
                                                    appearance: 'none',
                                                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'right 8px center',
                                                    backgroundSize: '12px',
                                                    paddingRight: '30px'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(6, 182, 212, 0.3)';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(6, 182, 212, 0.2)';
                                                }}
                                            >
                                                <option value="1" style={{ background: '#1e293b', color: '#ffffff' }}>1 Day</option>
                                                <option value="3" style={{ background: '#1e293b', color: '#ffffff' }}>3 Days</option>
                                                <option value="7" style={{ background: '#1e293b', color: '#ffffff' }}>1 Week</option>
                                                <option value="14" style={{ background: '#1e293b', color: '#ffffff' }}>2 Weeks</option>
                                                <option value="15" style={{ background: '#1e293b', color: '#ffffff' }}>15 Days</option>
                                                <option value="30" style={{ background: '#1e293b', color: '#ffffff' }}>30 Days</option>
                                            </select>
                                        </div>

                                        {/* Payroll Excel Export Button */}
                                        <button
                                            onClick={exportPayrollToExcel}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                                color: 'white',
                                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.2)';
                                            }}
                                        >
                                            <span>📊</span>
                                            <span className="mobile-hidden">Export Payroll</span>
                                            <span className="mobile-only">Excel</span>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Payroll Summary Cards */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '1rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(34, 197, 94, 0.2)',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏱️</div>
                                        <div style={{ color: '#22c55e', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                                            Total Hours
                                        </div>
                                        <div style={{ color: '#1e293b', fontSize: '1.4rem', fontWeight: '700' }}>
                                            0.0 hrs
                                        </div>
                                    </div>
                                    
                                    <div style={{
                                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💰</div>
                                        <div style={{ color: '#3b82f6', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                                            Total Earnings
                                        </div>
                                        <div style={{ color: '#1e293b', fontSize: '1.4rem', fontWeight: '700' }}>
                                            ₱0.00
                                        </div>
                                    </div>
                                    
                                    <div style={{
                                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(245, 158, 11, 0.2)',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👥</div>
                                        <div style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                                            Active Staff
                                        </div>
                                        <div style={{ color: '#1e293b', fontSize: '1.4rem', fontWeight: '700' }}>
                                            0
                                        </div>
                                    </div>
                                    
                                    <div style={{
                                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(139, 92, 246, 0.2)',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
                                        <div style={{ color: '#8b5cf6', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                                            Avg Hours/Day
                                        </div>
                                        <div style={{ color: '#1e293b', fontSize: '1.4rem', fontWeight: '700' }}>
                                            0.0 hrs
                                        </div>
                                    </div>
                                </div>
                                
                                <TimeTracking
                                    currentUser={{ id: 'admin', username: 'Administrator' }}
                                    isAdmin={true}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Menu Management Tab */}
                {activeTab === 'menu' && (
                    <MenuManagement />
                )}

                {/* Clear All Data Button - Moved to bottom */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
                    <button
                        style={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)'
                        }}
                        onClick={handleClearAll}
                    >
                        🧹 Clear All Data
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
