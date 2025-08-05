import React, { useState, useEffect } from 'react';
import { useOrderContext } from '../context/OrderContext';
import { StaffPerformance, PeakHourData, MenuItemProfitability } from '../types';

const AdvancedAnalytics: React.FC = () => {
    const { processedOrders, menuItems } = useOrderContext();
    const [activeTab, setActiveTab] = useState<'peak-hours' | 'staff-performance' | 'profitability' | 'trends'>('peak-hours');
    const [dateRange, setDateRange] = useState('7days');
    const [peakHourData, setPeakHourData] = useState<PeakHourData[]>([]);
    const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
    const [profitabilityData, setProfitabilityData] = useState<MenuItemProfitability[]>([]);

    useEffect(() => {
        generateAnalytics();
    }, [processedOrders, dateRange]);

    const generateAnalytics = () => {
        const now = new Date();
        const daysBack = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
        const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

        const filteredOrders = processedOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate && (order.status === 'completed' || order.status === 'served');
        });

        generatePeakHourData(filteredOrders);
        generateStaffPerformance(filteredOrders);
        generateProfitabilityData(filteredOrders);
    };

    const generatePeakHourData = (orders: any[]) => {
        const hourlyData: { [key: string]: { orderCount: number; totalSales: number } } = {};

        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const hour = orderDate.getHours();
            const day = orderDate.toLocaleDateString('en-US', { weekday: 'long' });
            const key = `${day}-${hour}`;

            if (!hourlyData[key]) {
                hourlyData[key] = { orderCount: 0, totalSales: 0 };
            }

            hourlyData[key].orderCount += 1;
            hourlyData[key].totalSales += order.total;
        });

        const peakData: PeakHourData[] = Object.entries(hourlyData).map(([key, data]) => {
            const [day, hourStr] = key.split('-');
            const hour = parseInt(hourStr);
            return {
                hour,
                day,
                orderCount: data.orderCount,
                totalSales: data.totalSales,
                averageOrderValue: data.totalSales / data.orderCount
            };
        }).sort((a, b) => b.orderCount - a.orderCount);

        setPeakHourData(peakData);
    };

    const generateStaffPerformance = (orders: any[]) => {
        // Load time tracking data
        const timeEntries = JSON.parse(localStorage.getItem('time-entries') || '[]');
        const employees = JSON.parse(localStorage.getItem('p-town-cashiers') || '[]');

        const performanceData: { [key: string]: StaffPerformance } = {};

        // Initialize performance data for each employee
        employees.forEach((emp: any) => {
            const empTimeEntries = timeEntries.filter((entry: any) => entry.employeeId === emp.id);
            const hoursWorked = calculateHoursWorked(empTimeEntries);
            
            performanceData[emp.id] = {
                employeeId: emp.id,
                employeeName: emp.name,
                date: new Date().toISOString().split('T')[0],
                ordersProcessed: 0,
                totalSales: 0,
                hoursWorked,
                ordersPerHour: 0,
                salesPerHour: 0
            };
        });

        // Add order data
        orders.forEach(order => {
            if (order.cashierName && performanceData[order.cashierName]) {
                performanceData[order.cashierName].ordersProcessed += 1;
                performanceData[order.cashierName].totalSales += order.total;
            }
        });

        // Calculate rates
        Object.values(performanceData).forEach(perf => {
            if (perf.hoursWorked > 0) {
                perf.ordersPerHour = perf.ordersProcessed / perf.hoursWorked;
                perf.salesPerHour = perf.totalSales / perf.hoursWorked;
            }
        });

        setStaffPerformance(Object.values(performanceData).filter(perf => perf.ordersProcessed > 0));
    };

    const calculateHoursWorked = (timeEntries: any[]) => {
        // Simple calculation - in real implementation, this would be more sophisticated
        const clockInEntries = timeEntries.filter(entry => entry.type === 'clock-in');
        const clockOutEntries = timeEntries.filter(entry => entry.type === 'clock-out');
        
        if (clockInEntries.length === 0) return 0;
        
        // Simplified: assume 8 hours per day if clocked in
        return clockInEntries.length * 8;
    };

    const generateProfitabilityData = (orders: any[]) => {
        const itemData: { [key: number]: { sold: number; revenue: number } } = {};

        orders.forEach(order => {
            Object.entries(order.items).forEach(([itemIdStr, quantity]) => {
                const itemId = parseInt(itemIdStr);
                if (!itemData[itemId]) {
                    itemData[itemId] = { sold: 0, revenue: 0 };
                }
                
                const item = menuItems.find(m => m.id === itemId);
                if (item) {
                    itemData[itemId].sold += quantity as number;
                    itemData[itemId].revenue += (quantity as number) * item.price;
                }
            });
        });

        const profitData: MenuItemProfitability[] = Object.entries(itemData).map(([itemIdStr, data]) => {
            const itemId = parseInt(itemIdStr);
            const item = menuItems.find(m => m.id === itemId);
            const cost = (item?.cost || 0) * data.sold;
            const profit = data.revenue - cost;
            const profitMargin = data.revenue > 0 ? (profit / data.revenue) * 100 : 0;

            return {
                itemId,
                itemName: item?.name || 'Unknown Item',
                unitsSold: data.sold,
                revenue: data.revenue,
                cost,
                profit,
                profitMargin
            };
        }).sort((a, b) => b.profit - a.profit);

        setProfitabilityData(profitData);
    };

    const renderPeakHoursTab = () => (
        <div>
            <h3>Peak Hours Analysis</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {peakHourData.slice(0, 12).map((data, index) => (
                    <div key={`${data.day}-${data.hour}`} style={{
                        border: '1px solid #ddd',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        backgroundColor: index < 3 ? '#fff3cd' : 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        position: 'relative'
                    }}>
                        {index < 3 && (
                            <div style={{
                                position: 'absolute',
                                top: '0.5rem',
                                right: '0.5rem',
                                background: '#ffc107',
                                color: 'white',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '10px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>
                                #{index + 1} Peak
                            </div>
                        )}
                        
                        <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>
                            {data.day} at {data.hour}:00
                        </h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <div>
                                <strong>Orders:</strong><br />
                                <span style={{ fontSize: '1.5rem', color: '#007bff', fontWeight: 'bold' }}>
                                    {data.orderCount}
                                </span>
                            </div>
                            <div>
                                <strong>Sales:</strong><br />
                                <span style={{ fontSize: '1.2rem', color: '#28a745', fontWeight: 'bold' }}>
                                    ₱{data.totalSales.toFixed(0)}
                                </span>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <strong>Avg Order Value:</strong><br />
                                ₱{data.averageOrderValue.toFixed(2)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStaffPerformanceTab = () => (
        <div>
            <h3>Staff Performance Metrics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {staffPerformance.map(staff => (
                    <div key={staff.employeeId} style={{
                        border: '1px solid #ddd',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        backgroundColor: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>
                            {staff.employeeName}
                        </h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div>
                                <strong>Orders Processed:</strong><br />
                                <span style={{ fontSize: '1.5rem', color: '#007bff', fontWeight: 'bold' }}>
                                    {staff.ordersProcessed}
                                </span>
                            </div>
                            <div>
                                <strong>Total Sales:</strong><br />
                                <span style={{ fontSize: '1.2rem', color: '#28a745', fontWeight: 'bold' }}>
                                    ₱{staff.totalSales.toFixed(0)}
                                </span>
                            </div>
                            <div>
                                <strong>Hours Worked:</strong><br />
                                {staff.hoursWorked.toFixed(1)}h
                            </div>
                            <div>
                                <strong>Orders/Hour:</strong><br />
                                {staff.ordersPerHour.toFixed(1)}
                            </div>
                        </div>
                        
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <strong>Sales per Hour</strong><br />
                            ₱{staff.salesPerHour.toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderProfitabilityTab = () => (
        <div>
            <h3>Menu Item Profitability</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Item</th>
                            <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>Units Sold</th>
                            <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>Revenue</th>
                            <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>Cost</th>
                            <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>Profit</th>
                            <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid #dee2e6' }}>Margin %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profitabilityData.map(item => (
                            <tr key={item.itemId} style={{ borderBottom: '1px solid #f8f9fa' }}>
                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{item.itemName}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>{item.unitsSold}</td>
                                <td style={{ padding: '1rem', textAlign: 'right', color: '#28a745' }}>₱{item.revenue.toFixed(2)}</td>
                                <td style={{ padding: '1rem', textAlign: 'right', color: '#dc3545' }}>₱{item.cost.toFixed(2)}</td>
                                <td style={{ padding: '1rem', textAlign: 'right', color: item.profit >= 0 ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                                    ₱{item.profit.toFixed(2)}
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right', color: item.profitMargin >= 20 ? '#28a745' : item.profitMargin >= 10 ? '#ffc107' : '#dc3545' }}>
                                    {item.profitMargin.toFixed(1)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderTrendsTab = () => (
        <div>
            <h3>Seasonal Trends & Forecasting</h3>
            <div style={{
                textAlign: 'center',
                padding: '3rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                color: '#666'
            }}>
                <h4>Coming Soon!</h4>
                <p>Advanced trend analysis and forecasting features will include:</p>
                <ul style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
                    <li>Daily, weekly, and monthly sales patterns</li>
                    <li>Seasonal menu item performance</li>
                    <li>Weather impact on sales</li>
                    <li>Predictive inventory planning</li>
                    <li>Customer behavior patterns</li>
                </ul>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Advanced Analytics</h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                    </select>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto' }}>
                <button
                    onClick={() => setActiveTab('peak-hours')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: activeTab === 'peak-hours' ? '#007bff' : '#e9ecef',
                        color: activeTab === 'peak-hours' ? 'white' : '#495057',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                    }}
                >
                    📊 Peak Hours
                </button>
                <button
                    onClick={() => setActiveTab('staff-performance')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: activeTab === 'staff-performance' ? '#007bff' : '#e9ecef',
                        color: activeTab === 'staff-performance' ? 'white' : '#495057',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                    }}
                >
                    👥 Staff Performance
                </button>
                <button
                    onClick={() => setActiveTab('profitability')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: activeTab === 'profitability' ? '#007bff' : '#e9ecef',
                        color: activeTab === 'profitability' ? 'white' : '#495057',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                    }}
                >
                    💰 Profitability
                </button>
                <button
                    onClick={() => setActiveTab('trends')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: activeTab === 'trends' ? '#007bff' : '#e9ecef',
                        color: activeTab === 'trends' ? 'white' : '#495057',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                    }}
                >
                    📈 Trends
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'peak-hours' && renderPeakHoursTab()}
            {activeTab === 'staff-performance' && renderStaffPerformanceTab()}
            {activeTab === 'profitability' && renderProfitabilityTab()}
            {activeTab === 'trends' && renderTrendsTab()}
        </div>
    );
};

export default AdvancedAnalytics;
