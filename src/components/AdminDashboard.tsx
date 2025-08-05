import React, { useState, useEffect } from 'react';
import { useOrderContext } from '../context/OrderContext';
import { SalesData } from '../types';
import OrderQueue from './OrderQueue';
import CashierManagement from './CashierManagement';

interface AdminDashboardProps {
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const { getSalesData, processedOrders, getTodaysSales, getTodaysOrderCount, refreshData, clearAllData, getPendingOrdersCount } = useOrderContext();
    const [activeTab, setActiveTab] = useState<'summary' | 'orders' | 'queue' | 'cashiers'>('summary');
    const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('day');
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
        const width = 350; // Reduced for better responsiveness
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
                <svg width="100%" height={height} style={{ overflow: 'visible', maxWidth: `${width}px` }} viewBox={`0 0 ${width} ${height}`}>
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

        const radius = 70; // Reduced to fit better
        const centerX = 100; // Adjusted for new viewBox
        const centerY = 90; // Adjusted for new viewBox
        
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
                    <svg width="100%" height="180" style={{ maxWidth: "200px" }} viewBox="0 0 200 180">
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

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            padding: '1.5rem'
        }} className="admin-dashboard-container admin-dashboard">
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
                </div>

                {/* Content based on active tab */}
                {activeTab === 'summary' && (
                    <div>
                        {/* Time Period Selector */}
                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginBottom: '2rem',
                            justifyContent: 'center'
                        }}>
                            {(['day', 'week', 'month'] as const).map(period => (
                                <button
                                    key={period}
                                    onClick={() => setTimePeriod(period)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: timePeriod === period 
                                            ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' 
                                            : 'rgba(148, 163, 184, 0.1)',
                                        color: timePeriod === period ? 'white' : '#475569',
                                        border: timePeriod === period 
                                            ? '2px solid rgba(59, 130, 246, 0.3)' 
                                            : '2px solid rgba(148, 163, 184, 0.2)',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        fontSize: '0.95rem',
                                        fontWeight: '600',
                                        transition: 'all 0.3s ease',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {period === 'day' ? '1 Day' : period === 'week' ? '1 Week' : '1 Month'}
                                </button>
                            ))}
                        </div>

                        {/* Summary Cards */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '1.5rem',
                            marginBottom: '2rem'
                        }} className="summary-cards">
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                                padding: '1.5rem',
                                borderRadius: '15px',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                textAlign: 'center'
                            }}>
                                <h3 style={{ color: '#3b82f6', fontSize: '1rem', marginBottom: '0.5rem' }}>
                                    Today's Sales
                                </h3>
                                <p style={{ color: '#1e293b', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
                                    ₱{dayData.total.toLocaleString()}
                                </p>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                                    {dayData.count} orders
                                </p>
                            </div>
                            
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                                padding: '1.5rem',
                                borderRadius: '15px',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                textAlign: 'center'
                            }}>
                                <h3 style={{ color: '#10b981', fontSize: '1rem', marginBottom: '0.5rem' }}>
                                    Weekly Sales
                                </h3>
                                <p style={{ color: '#1e293b', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
                                    ₱{weekData.total.toLocaleString()}
                                </p>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                                    {weekData.count} orders
                                </p>
                            </div>
                            
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                                padding: '1.5rem',
                                borderRadius: '15px',
                                border: '1px solid rgba(245, 158, 11, 0.2)',
                                textAlign: 'center'
                            }}>
                                <h3 style={{ color: '#f59e0b', fontSize: '1rem', marginBottom: '0.5rem' }}>
                                    Monthly Sales
                                </h3>
                                <p style={{ color: '#1e293b', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
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
                        }} className="charts-grid">
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

                {/* Cashier Management Tab */}
                {activeTab === 'cashiers' && (
                    <CashierManagement />
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
