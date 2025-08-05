import React, { useState } from 'react';
import { useOrderContext } from '../context/OrderContext';
import OrderQueue from './OrderQueue';
import TimeTracking from './TimeTracking';
import MenuManagement from './MenuManagement';
import InventoryManagement from './InventoryManagement';

interface CashierDashboardProps {
    onLogout: () => void;
    cashierName: string;
    cashierId: string;
    cashierRole: string;
}

const CashierDashboard: React.FC<CashierDashboardProps> = ({ onLogout, cashierName, cashierId, cashierRole }) => {
    const { addOrder, getTodaysSales, getTodaysOrderCount, menuItems, getPendingOrdersCount } = useOrderContext();
    const [cart, setCart] = useState<{ [key: number]: number }>({});
    const [orderType, setOrderType] = useState<'dine-in' | 'take-out'>('dine-in');
    const [activeTab, setActiveTab] = useState<'pos' | 'queue' | 'timetracking' | 'menu' | 'inventory'>('pos');
    const [customerName, setCustomerName] = useState<string>('');
    const [tableNumber, setTableNumber] = useState<number | ''>('');
    
    // Simple responsive detection for iPad/tablet
    const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);
    
    React.useEffect(() => {
        const handleResize = () => {
            setIsTablet(window.innerWidth <= 1024);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const addToCart = (itemId: number) => {
        setCart(prev => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
        }));
    };

    const removeFromCart = (itemId: number) => {
        setCart(prev => {
            const newCart = { ...prev };
            if (newCart[itemId] > 1) {
                newCart[itemId]--;
            } else {
                delete newCart[itemId];
            }
            return newCart;
        });
    };

    const calculateTotal = () => {
        return Object.entries(cart).reduce((total, [itemId, quantity]) => {
            const item = menuItems.find(item => item.id === parseInt(itemId));
            return total + (item ? item.price * quantity : 0);
        }, 0);
    };

    const processOrder = () => {
        if (Object.keys(cart).length === 0) {
            alert('Cart is empty!');
            return;
        }
        
        const total = calculateTotal();
        
        // Add order to context (which will sync to admin)
        const orderData: any = {
            items: cart,
            orderType: orderType,
            total: total,
            cashierName: cashierName
        };

        // Add customer details if provided
        if (customerName.trim()) {
            orderData.customerName = customerName.trim();
        }
        if (orderType === 'dine-in' && tableNumber) {
            orderData.tableNumber = Number(tableNumber);
        }

        addOrder(orderData);
        
        // Clear the form after successful order
        setCart({});
        setCustomerName('');
        setTableNumber('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Header with Tabs */}
            <header style={{ 
                padding: '1rem', 
                borderBottom: '1px solid #ddd',
                backgroundColor: '#f8f9fa'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h2>P-Town POS System</h2>
                        <div style={{ fontSize: '1rem', color: '#2196f3', fontWeight: '600', marginBottom: '0.5rem' }}>
                            👤 Cashier: {cashierName}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                            Today's Sales: ₱{getTodaysSales().toFixed(2)} | Orders: {getTodaysOrderCount()}
                        </div>
                    </div>
                    <button 
                        onClick={onLogout}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Logout
                    </button>
                </div>

                {/* Tab Navigation */}
                <div style={{ 
                    display: 'flex', 
                    gap: '0',
                    flexWrap: isTablet ? 'wrap' : 'nowrap',
                    justifyContent: isTablet ? 'space-around' : 'flex-start'
                }}>
                    <button
                        onClick={() => setActiveTab('pos')}
                        style={{
                            padding: isTablet ? '1rem 1.2rem' : '0.75rem 1.5rem',
                            backgroundColor: activeTab === 'pos' ? '#4caf50' : '#e9ecef',
                            color: activeTab === 'pos' ? 'white' : '#495057',
                            border: '1px solid #dee2e6',
                            borderRadius: '8px 0 0 8px',
                            cursor: 'pointer',
                            fontSize: isTablet ? '1.1rem' : '1rem',
                            fontWeight: activeTab === 'pos' ? 'bold' : 'normal',
                            minHeight: isTablet ? '50px' : '40px',
                            flex: isTablet ? '1' : 'none'
                        }}
                    >
                        🛒 Point of Sale
                    </button>
                    <button
                        onClick={() => setActiveTab('queue')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: activeTab === 'queue' ? '#4caf50' : '#e9ecef',
                            color: activeTab === 'queue' ? 'white' : '#495057',
                            border: '1px solid #dee2e6',
                            borderLeft: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: activeTab === 'queue' ? 'bold' : 'normal',
                            position: 'relative'
                        }}
                    >
                        📋 Order Queue
                        {getPendingOrdersCount() > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                fontSize: '0.7rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}>
                                {getPendingOrdersCount()}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('timetracking')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: activeTab === 'timetracking' ? '#4caf50' : '#e9ecef',
                            color: activeTab === 'timetracking' ? 'white' : '#495057',
                            border: '1px solid #dee2e6',
                            borderLeft: 'none',
                            borderRadius: cashierRole === 'manager' ? '0' : '0 8px 8px 0',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: activeTab === 'timetracking' ? 'bold' : 'normal'
                        }}
                    >
                        ⏰ Time Clock
                    </button>
                    {cashierRole === 'manager' && (
                        <>
                            <button
                                onClick={() => setActiveTab('menu')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: activeTab === 'menu' ? '#4caf50' : '#e9ecef',
                                    color: activeTab === 'menu' ? 'white' : '#495057',
                                    border: '1px solid #dee2e6',
                                    borderLeft: 'none',
                                    borderRadius: '0',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: activeTab === 'menu' ? 'bold' : 'normal'
                                }}
                            >
                                🍽️ Menu Management
                            </button>
                            <button
                                onClick={() => setActiveTab('inventory')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: activeTab === 'inventory' ? '#4caf50' : '#e9ecef',
                                    color: activeTab === 'inventory' ? 'white' : '#495057',
                                    border: '1px solid #dee2e6',
                                    borderLeft: 'none',
                                    borderRadius: '0 8px 8px 0',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: activeTab === 'inventory' ? 'bold' : 'normal'
                                }}
                            >
                                📦 Inventory
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* Tab Content */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
                {activeTab === 'pos' ? (
                    <POSInterface 
                        menuItems={menuItems}
                        cart={cart}
                        orderType={orderType}
                        customerName={customerName}
                        tableNumber={tableNumber}
                        addToCart={addToCart}
                        removeFromCart={removeFromCart}
                        calculateTotal={calculateTotal}
                        processOrder={processOrder}
                        setOrderType={setOrderType}
                        setCustomerName={setCustomerName}
                        setTableNumber={setTableNumber}
                        isTablet={isTablet}
                    />
                ) : activeTab === 'queue' ? (
                    <OrderQueue currentUser={{ id: cashierId, username: cashierName }} />
                ) : activeTab === 'timetracking' ? (
                    <TimeTracking 
                        currentUser={{ id: cashierId, username: cashierName }}
                        isAdmin={false}
                    />
                ) : activeTab === 'menu' && cashierRole === 'manager' ? (
                    <MenuManagement />
                ) : activeTab === 'inventory' && cashierRole === 'manager' ? (
                    <InventoryManagement />
                ) : (
                    <TimeTracking 
                        currentUser={{ id: cashierId, username: cashierName }}
                        isAdmin={false}
                    />
                )}
            </div>
        </div>
    );
};

// Separate POS Interface Component
interface POSInterfaceProps {
    menuItems: any[];
    cart: { [key: number]: number };
    orderType: 'dine-in' | 'take-out';
    customerName: string;
    tableNumber: number | '';
    addToCart: (itemId: number) => void;
    removeFromCart: (itemId: number) => void;
    calculateTotal: () => number;
    processOrder: () => void;
    setOrderType: (type: 'dine-in' | 'take-out') => void;
    setCustomerName: (name: string) => void;
    setTableNumber: (table: number | '') => void;
    isTablet: boolean;
}

const POSInterface: React.FC<POSInterfaceProps> = ({
    menuItems,
    cart,
    orderType,
    customerName,
    tableNumber,
    addToCart,
    removeFromCart,
    calculateTotal,
    processOrder,
    setOrderType,
    setCustomerName,
    setTableNumber,
    isTablet
}) => {
    return (
        <div style={{ 
            display: 'flex', 
            height: '100%',
            flexDirection: isTablet ? 'column' : 'row'
        }}>
            {/* Menu Section */}
            <div style={{ 
                flex: isTablet ? 'none' : 2, 
                padding: isTablet ? '0.8rem' : '1rem', 
                borderRight: isTablet ? 'none' : '1px solid #ddd',
                borderBottom: isTablet ? '1px solid #ddd' : 'none',
                overflow: 'auto',
                maxHeight: isTablet ? '60vh' : 'none'
            }}>
                <h3 style={{ marginTop: 0, fontSize: isTablet ? '1.2rem' : '1.5rem' }}>Menu Items</h3>
                
                {menuItems.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '8px',
                        color: '#666'
                    }}>
                        <h4>No menu items available</h4>
                        <p>Switch to "Menu Management" tab to add items.</p>
                    </div>
                ) : (
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: isTablet 
                            ? 'repeat(auto-fill, minmax(160px, 1fr))' 
                            : 'repeat(auto-fill, minmax(200px, 1fr))', 
                        gap: isTablet ? '0.8rem' : '1rem' 
                    }}>
                        {menuItems.map(item => (
                            <div 
                                key={item.id}
                                style={{
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    padding: isTablet ? '0.8rem' : '1rem',
                                    textAlign: 'center',
                                    cursor: item.available ? 'pointer' : 'not-allowed',
                                    backgroundColor: item.available ? 'white' : '#f5f5f5',
                                    boxShadow: item.available ? '0 2px 4px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.05)',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    minHeight: isTablet ? '110px' : '140px',
                                    opacity: item.available ? 1 : 0.6,
                                    position: 'relative'
                                }}
                                onClick={() => item.available && addToCart(item.id)}
                                onMouseOver={(e) => {
                                    if (item.available) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (item.available) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                    }
                                }}
                            >
                                {!item.available && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        background: '#ff4444',
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold'
                                    }}>
                                        UNAVAILABLE
                                    </div>
                                )}
                                <h3 style={{ 
                                    margin: '0 0 0.5rem 0', 
                                    color: item.available ? '#333' : '#999',
                                    textDecoration: item.available ? 'none' : 'line-through'
                                }}>
                                    {item.name}
                                </h3>
                                <p style={{ 
                                    margin: '0', 
                                    fontSize: '1.2rem', 
                                    fontWeight: 'bold', 
                                    color: item.available ? '#4caf50' : '#999'
                                }}>
                                    ₱{item.price.toFixed(2)}
                                </p>
                                {!item.available && (
                                    <p style={{ 
                                        margin: '0.5rem 0 0 0', 
                                        fontSize: '0.8rem', 
                                        color: '#666',
                                        fontStyle: 'italic'
                                    }}>
                                        Currently unavailable
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cart Section */}
            <div style={{ 
                flex: isTablet ? 'none' : 1, 
                padding: isTablet ? '0.8rem' : '1rem', 
                backgroundColor: '#f9f9f9',
                minHeight: isTablet ? '40vh' : 'auto',
                display: 'flex',
                flexDirection: 'column',
                height: isTablet ? '40vh' : '100%'
            }}>
                <h3 style={{ 
                    fontSize: isTablet ? '1.2rem' : '1.5rem',
                    margin: '0 0 1rem 0',
                    flexShrink: 0
                }}>Current Order</h3>
                
                <div style={{ 
                    marginBottom: '1rem',
                    flexShrink: 0
                }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontWeight: 'bold', 
                        fontSize: isTablet ? '0.9rem' : '1rem', 
                        color: '#333' 
                    }}>Order Type:</label>
                    <div style={{ 
                        display: 'flex', 
                        gap: '0', 
                        width: '100%', 
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
                        borderRadius: '8px', 
                        overflow: 'hidden' 
                    }}>
                        <button
                            onClick={() => setOrderType('dine-in')}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                backgroundColor: orderType === 'dine-in' ? '#4caf50' : '#ffffff',
                                color: orderType === 'dine-in' ? 'white' : '#495057',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: orderType === 'dine-in' ? 'bold' : '500',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                position: 'relative'
                            }}
                            onMouseOver={(e) => {
                                if (orderType !== 'dine-in') {
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (orderType !== 'dine-in') {
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            🍽️ Dine In
                            {orderType === 'dine-in' && (
                                <span style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    fontSize: '0.8rem'
                                }}>
                                    ✓
                                </span>
                            )}
                        </button>
                        <div style={{ width: '1px', backgroundColor: '#dee2e6' }}></div>
                        <button
                            onClick={() => setOrderType('take-out')}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                backgroundColor: orderType === 'take-out' ? '#4caf50' : '#ffffff',
                                color: orderType === 'take-out' ? 'white' : '#495057',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: orderType === 'take-out' ? 'bold' : '500',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                position: 'relative'
                            }}
                            onMouseOver={(e) => {
                                if (orderType !== 'take-out') {
                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (orderType !== 'take-out') {
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            🥡 Take Out
                            {orderType === 'take-out' && (
                                <span style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    fontSize: '0.8rem'
                                }}>
                                    ✓
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Customer Details */}
                <div style={{ marginBottom: '1rem' }}>
                    {orderType === 'dine-in' ? (
                        <div style={{ marginBottom: '0.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                Table Number (Optional):
                            </label>
                            <input
                                type="number"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value ? parseInt(e.target.value) : '')}
                                placeholder="Enter table number"
                                style={{
                                    padding: '0.5rem',
                                    width: '100%',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    fontSize: '1rem'
                                }}
                                min="1"
                                max="50"
                            />
                        </div>
                    ) : (
                        <div style={{ marginBottom: '0.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                Customer Name (Optional):
                            </label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Enter customer name"
                                style={{
                                    padding: '0.5rem',
                                    width: '100%',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    fontSize: '1rem'
                                }}
                                maxLength={50}
                            />
                        </div>
                    )}
                </div>

                {/* Cart Items - Scrollable Section */}
                <div style={{ 
                    marginBottom: '1rem', 
                    maxHeight: isTablet ? '25vh' : '300px', 
                    overflowY: 'auto',
                    flex: 1,
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    backgroundColor: 'white'
                }}>
                    {Object.keys(cart).length === 0 ? (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>Cart is empty</p>
                    ) : (
                        Object.entries(cart).map(([itemId, quantity]) => {
                            const item = menuItems.find(item => item.id === parseInt(itemId));
                            if (!item) return null;
                            
                            return (
                                <div key={itemId} style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    padding: '0.5rem',
                                    borderBottom: '1px solid #eee'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                            ₱{item.price} x {quantity}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <button 
                                            onClick={() => removeFromCart(item.id)}
                                            style={{ 
                                                padding: '0.25rem 0.5rem', 
                                                backgroundColor: '#f44336', 
                                                color: 'white', 
                                                border: 'none', 
                                                borderRadius: '3px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            -
                                        </button>
                                        <span>{quantity}</span>
                                        <button 
                                            onClick={() => addToCart(item.id)}
                                            style={{ 
                                                padding: '0.25rem 0.5rem', 
                                                backgroundColor: '#4caf50', 
                                                color: 'white', 
                                                border: 'none', 
                                                borderRadius: '3px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Checkout Section - Sticky Footer */}
                <div style={{ 
                    borderTop: '2px solid #ddd', 
                    paddingTop: '1rem',
                    backgroundColor: '#f9f9f9',
                    marginTop: 'auto',
                    flexShrink: 0
                }}>
                    <div style={{ 
                        fontSize: isTablet ? '1.1rem' : '1.2rem', 
                        fontWeight: 'bold', 
                        marginBottom: '1rem',
                        textAlign: 'center',
                        padding: '0.5rem',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        border: '2px solid #4caf50'
                    }}>
                        Total: ₱{calculateTotal().toFixed(2)}
                    </div>
                    
                    <button
                        onClick={processOrder}
                        disabled={Object.keys(cart).length === 0}
                        style={{
                            width: '100%',
                            padding: isTablet ? '1.2rem' : '1rem',
                            backgroundColor: Object.keys(cart).length === 0 ? '#ccc' : '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: isTablet ? '1.2rem' : '1.1rem',
                            fontWeight: 'bold',
                            cursor: Object.keys(cart).length === 0 ? 'not-allowed' : 'pointer',
                            boxShadow: Object.keys(cart).length === 0 ? 'none' : '0 4px 8px rgba(76, 175, 80, 0.3)',
                            transition: 'all 0.2s ease',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            minHeight: isTablet ? '60px' : '50px'
                        }}
                    >
                        Process Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CashierDashboard;
