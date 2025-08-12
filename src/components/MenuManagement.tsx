import React, { useState, useEffect } from 'react';
import { useOrderContext } from '../context/OrderContext';

interface EnhancedMenuItem {
    id: number;
    name: string;
    price: number;
    category?: string;
    description?: string;
    available?: boolean;
    cost?: number;
    stock?: number;
    lowStockThreshold?: number;
    unit?: string;
    supplier?: string;
    lastRestocked?: string;
}

interface StockAlert {
    id: number;
    itemName: string;
    currentStock: number;
    threshold: number;
    severity: 'low' | 'critical' | 'out-of-stock';
}

interface PerformanceAlert {
    type: 'low-sales';
    message: string;
    severity: 'warning' | 'critical';
}

const MenuManagement: React.FC = () => {
    const handleSyncMenuConfig = async () => {
        const { dataService } = await import('../utils/dataService');
        // Convert EnhancedMenuItem[] to MenuItem[] (id as string)
        const items = menuItems.map(item => ({
            ...item,
            id: String(item.id),
            category: item.category ?? ''
        }));
        await dataService.syncMenuToConfig(items);
        alert('Menu synced to /config/menu in Firebase!');
    };
    const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, processedOrders } = useOrderContext();
    const [editingItem, setEditingItem] = useState<EnhancedMenuItem | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
    const [performanceAlerts, setPerformanceAlerts] = useState<PerformanceAlert[]>([]);
    const [viewMode, setViewMode] = useState<'menu' | 'inventory' | 'alerts'>('menu');
    const [formData, setFormData] = useState({ name: '', price: 0, cost: 0, category: '' });
    const [enhancedMenuItems, setEnhancedMenuItems] = useState<EnhancedMenuItem[]>([]);

    useEffect(() => {
        setEnhancedMenuItems(prev => {
            // If prev is empty, initialize from menuItems
            if (prev.length === 0) {
                const enhanced = menuItems.map(item => ({
                    ...item,
                    stock: Math.floor(Math.random() * 50) + 10,
                    lowStockThreshold: 5,
                    unit: 'pieces',
                    supplier: 'Default Supplier',
                    lastRestocked: new Date().toISOString()
                }));
                checkStockAlerts(enhanced);
                checkPerformanceAlerts();
                return enhanced;
            } else {
                // Preserve previous stock values
                const enhanced = menuItems.map(item => {
                    const prevItem = prev.find(p => p.id === item.id);
                    return {
                        ...item,
                        stock: typeof prevItem?.stock === 'number' ? prevItem.stock : Math.floor(Math.random() * 50) + 10,
                        lowStockThreshold: prevItem?.lowStockThreshold || 5,
                        unit: prevItem?.unit || 'pieces',
                        supplier: prevItem?.supplier || 'Default Supplier',
                        lastRestocked: prevItem?.lastRestocked || new Date().toISOString()
                    };
                });
                checkStockAlerts(enhanced);
                checkPerformanceAlerts();
                return enhanced;
            }
        });
    }, [menuItems, processedOrders]);

    const checkStockAlerts = (items: EnhancedMenuItem[]) => {
        const alerts: StockAlert[] = [];
        items.forEach(item => {
            const currentStock = item.stock || 0;
            const threshold = item.lowStockThreshold || 5;
            
            if (currentStock <= 0) {
                alerts.push({
                    id: item.id,
                    itemName: item.name,
                    currentStock,
                    threshold,
                    severity: 'out-of-stock'
                });
            } else if (currentStock <= threshold) {
                alerts.push({
                    id: item.id,
                    itemName: item.name,
                    currentStock,
                    threshold,
                    severity: currentStock <= threshold / 2 ? 'critical' : 'low'
                });
            }
        });
        setStockAlerts(alerts);
    };

    const checkPerformanceAlerts = () => {
        const alerts: PerformanceAlert[] = [];
        const today = new Date().toDateString();
        const todayOrders = processedOrders.filter(order => 
            new Date(order.createdAt).toDateString() === today
        );
        
        const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);
        const expectedDailySales = 5000;
        
        if (todaySales < expectedDailySales * 0.5) {
            alerts.push({
                type: 'low-sales',
                message: `Today's sales (₱${todaySales.toFixed(2)}) are significantly below target (₱${expectedDailySales.toFixed(2)})`,
                severity: 'critical'
            });
        } else if (todaySales < expectedDailySales * 0.8) {
            alerts.push({
                type: 'low-sales',
                message: `Today's sales (₱${todaySales.toFixed(2)}) are below target (₱${expectedDailySales.toFixed(2)})`,
                severity: 'warning'
            });
        }
        
        setPerformanceAlerts(alerts);
    };

    const handleAddItem = () => {
        if (formData.name.trim() && formData.price > 0) {
            addMenuItem({
                name: formData.name.trim(),
                price: formData.price,
                available: true,
                cost: formData.cost,
                category: formData.category
            });
            // Sync to Firestore
            import('../utils/dataService').then(({ dataService }) => {
                dataService.createMenuItem({
                    name: formData.name.trim(),
                    price: formData.price,
                    available: true,
                    cost: formData.cost,
                    category: formData.category
                });
            });
            setFormData({ name: '', price: 0, cost: 0, category: '' });
            setShowAddForm(false);
        }
    };

    const handleUpdateItem = () => {
        if (editingItem && formData.name.trim() && formData.price > 0) {
            updateMenuItem(editingItem.id, {
                name: formData.name.trim(),
                price: formData.price,
                available: editingItem.available || true,
                cost: formData.cost,
                category: formData.category
            });
            setEditingItem(null);
            setFormData({ name: '', price: 0, cost: 0, category: '' });
        }
    };

    const startEdit = (item: EnhancedMenuItem) => {
        setEditingItem(item);
        setFormData({ 
            name: item.name, 
            price: item.price, 
            cost: item.cost || 0, 
            category: item.category || ''
        });
        setShowAddForm(false);
    };

    const cancelEdit = () => {
        setEditingItem(null);
        setShowAddForm(false);
        setFormData({ name: '', price: 0, cost: 0, category: '' });
    };

    const handleDelete = (item: EnhancedMenuItem) => {
        if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
            deleteMenuItem(item.id);
        }
    };

    const updateStock = (itemId: number, newStock: number) => {
        setEnhancedMenuItems(prev => 
            prev.map(item => 
                item.id === itemId 
                    ? { ...item, stock: newStock, lastRestocked: new Date().toISOString() }
                    : item
            )
        );
    };

    const getStockStatus = (item: EnhancedMenuItem) => {
        const stock = item.stock || 0;
        const threshold = item.lowStockThreshold || 5;
        
        if (stock <= 0) return { status: 'out-of-stock', color: '#dc3545', text: 'Out of Stock' };
        if (stock <= threshold) return { status: 'low-stock', color: '#ffc107', text: 'Low Stock' };
        return { status: 'in-stock', color: '#28a745', text: 'In Stock' };
    };

    return (
        <div style={{ padding: '1rem' }}>
            {/* Header with View Mode Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setViewMode('menu')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: viewMode === 'menu' ? '#4caf50' : '#f8f9fa',
                            color: viewMode === 'menu' ? 'white' : '#333',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        📋 Menu Items
                    </button>
                    <button
                        onClick={() => setViewMode('inventory')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: viewMode === 'inventory' ? '#4caf50' : '#f8f9fa',
                            color: viewMode === 'inventory' ? 'white' : '#333',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        📦 Inventory
                    </button>
                    <button
                        onClick={() => setViewMode('alerts')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: viewMode === 'alerts' ? '#4caf50' : '#f8f9fa',
                            color: viewMode === 'alerts' ? 'white' : '#333',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                    >
                        🚨 Alerts
                        {(stockAlerts.length > 0 || performanceAlerts.length > 0) && (
                            <span style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {stockAlerts.length + performanceAlerts.length}
                            </span>
                        )}
                    </button>
                </div>
                
                {viewMode === 'menu' && (
                    <button
                        onClick={() => {
                            setShowAddForm(true);
                            setEditingItem(null);
                            setFormData({ name: '', price: 0, cost: 0, category: '' });
                        }}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        ➕ Add New Item
                    </button>
                )}
            </div>

            {/* Alerts View */}
            {viewMode === 'alerts' && (
                <div>
                    <button onClick={handleSyncMenuConfig} style={{marginBottom: '1rem'}}>Sync Menu to Config (Firebase)</button>
                    <h3>System Alerts</h3>
                    
                    {/* Stock Alerts */}
                    {stockAlerts.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ color: '#dc3545', marginBottom: '1rem' }}>
                                🚨 Stock Alerts ({stockAlerts.length})
                            </h4>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {stockAlerts.map(alert => (
                                    <div
                                        key={alert.id}
                                        style={{
                                            padding: '1rem',
                                            backgroundColor: alert.severity === 'out-of-stock' ? '#f8d7da' : 
                                                           alert.severity === 'critical' ? '#fff3cd' : '#d1ecf1',
                                            border: `1px solid ${alert.severity === 'out-of-stock' ? '#f5c6cb' : 
                                                                alert.severity === 'critical' ? '#ffeaa7' : '#bee5eb'}`,
                                            borderRadius: '4px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div>
                                            <strong>{alert.itemName}</strong>
                                            <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                                Current Stock: {alert.currentStock} | Threshold: {alert.threshold}
                                            </div>
                                        </div>
                                        <div style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            backgroundColor: alert.severity === 'out-of-stock' ? '#dc3545' : 
                                                           alert.severity === 'critical' ? '#ffc107' : '#17a2b8',
                                            color: 'white'
                                        }}>
                                            {alert.severity.toUpperCase().replace('-', ' ')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Performance Alerts */}
                    {performanceAlerts.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ color: '#ffc107', marginBottom: '1rem' }}>
                                📊 Performance Alerts ({performanceAlerts.length})
                            </h4>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {performanceAlerts.map((alert, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: '1rem',
                                            backgroundColor: alert.severity === 'critical' ? '#f8d7da' : '#fff3cd',
                                            border: `1px solid ${alert.severity === 'critical' ? '#f5c6cb' : '#ffeaa7'}`,
                                            borderRadius: '4px'
                                        }}
                                    >
                                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                            {alert.type.replace('-', ' ').toUpperCase()}
                                        </div>
                                        <div>{alert.message}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {stockAlerts.length === 0 && performanceAlerts.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            backgroundColor: '#d4edda',
                            borderRadius: '8px',
                            color: '#155724'
                        }}>
                            <h3>✅ All Systems Normal</h3>
                            <p>No alerts at this time. All inventory levels and performance metrics are within acceptable ranges.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Inventory View */}
            {viewMode === 'inventory' && (
                <div>
                    <h3>Inventory Management</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                        {enhancedMenuItems.map(item => {
                            const stockStatus = getStockStatus(item);
                            return (
                                <div 
                                    key={item.id}
                                    style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '1.5rem',
                                        backgroundColor: 'white',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.5rem 0' }}>{item.name}</h4>
                                            <div style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '12px',
                                                fontSize: '0.8rem',
                                                fontWeight: 'bold',
                                                backgroundColor: stockStatus.color,
                                                color: 'white',
                                                display: 'inline-block'
                                            }}>
                                                {stockStatus.text}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Current Stock</div>
                                            <div style={{ 
                                                fontSize: '1.5rem', 
                                                fontWeight: 'bold', 
                                                color: stockStatus.color 
                                            }}>
                                                {item.stock} {item.unit}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                                        <button
                                            onClick={() => updateStock(item.id, Math.max(0, (item.stock || 0) - 1))}
                                            style={{
                                                padding: '0.5rem',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={item.stock || 0}
                                            onChange={(e) => updateStock(item.id, Math.max(0, parseInt(e.target.value) || 0))}
                                            style={{
                                                width: '80px',
                                                padding: '0.5rem',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                textAlign: 'center'
                                            }}
                                        />
                                        <button
                                            onClick={() => updateStock(item.id, (item.stock || 0) + 1)}
                                            style={{
                                                padding: '0.5rem',
                                                backgroundColor: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            +
                                        </button>
                                        <button
                                            onClick={() => updateStock(item.id, (item.lowStockThreshold || 5) * 3)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            Restock
                                        </button>
                                    </div>

                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                        Last restocked: {item.lastRestocked ? new Date(item.lastRestocked).toLocaleDateString() : 'Never'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Menu Items View */}
            {viewMode === 'menu' && (
                <div>
                    {/* Add/Edit Form */}
                    {(showAddForm || editingItem) && (
                        <div style={{
                            backgroundColor: '#f9f9f9',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            marginBottom: '2rem',
                            border: '2px solid #4caf50'
                        }}>
                            <h3>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                        Item Name:
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter item name"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                        Category:
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        <option value="">Select Category</option>
                                        <option value="appetizer">Appetizer</option>
                                        <option value="main-course">Main Course</option>
                                        <option value="dessert">Dessert</option>
                                        <option value="beverage">Beverage</option>
                                        <option value="side-dish">Side Dish</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                        Cost (₱):
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.cost}
                                        onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                        Price (₱):
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}>
                                <button
                                    onClick={editingItem ? handleUpdateItem : handleAddItem}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: '#4caf50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {editingItem ? '✅ Update' : '➕ Add'}
                                </button>
                                <button
                                    onClick={cancelEdit}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ❌ Cancel
                                </button>
                                {formData.price > 0 && formData.cost > 0 && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0.75rem',
                                        backgroundColor: '#e3f2fd',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem',
                                        color: '#1976d2'
                                    }}>
                                        Profit Margin: {(((formData.price - formData.cost) / formData.price) * 100).toFixed(1)}%
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Menu Items Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {enhancedMenuItems.map(item => (
                            <div 
                                key={item.id}
                                style={{
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    padding: '1.5rem',
                                    backgroundColor: 'white',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ marginBottom: '1rem' }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                                        {item.name}
                                    </h3>
                                    {item.category && (
                                        <div style={{ 
                                            fontSize: '0.8rem', 
                                            color: '#666',
                                            backgroundColor: '#f0f0f0',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '12px',
                                            display: 'inline-block',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {item.category.replace('-', ' ').toUpperCase()}
                                        </div>
                                    )}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Selling Price</div>
                                            <div style={{ 
                                                fontSize: '1.5rem', 
                                                fontWeight: 'bold', 
                                                color: '#4caf50' 
                                            }}>
                                                ₱{item.price.toFixed(2)}
                                            </div>
                                        </div>
                                        {item.cost !== undefined && (
                                            <div>
                                                <div style={{ fontSize: '0.8rem', color: '#666' }}>Cost</div>
                                                <div style={{ 
                                                    fontSize: '1.2rem', 
                                                    fontWeight: 'bold', 
                                                    color: '#f44336' 
                                                }}>
                                                    ₱{item.cost.toFixed(2)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {item.cost !== undefined && item.cost > 0 && (
                                        <div style={{ 
                                            marginTop: '0.5rem',
                                            padding: '0.5rem',
                                            backgroundColor: '#e8f5e8',
                                            borderRadius: '4px',
                                            fontSize: '0.9rem'
                                        }}>
                                            <strong>Profit Margin: </strong>
                                            <span style={{ 
                                                color: ((item.price - item.cost) / item.price * 100) >= 20 ? '#4caf50' : '#ff9800',
                                                fontWeight: 'bold'
                                            }}>
                                                {(((item.price - item.cost) / item.price) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => startEdit(item)}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            backgroundColor: '#2196f3',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item)}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            backgroundColor: '#f44336',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>

                                {/* Item ID Badge */}
                                <div style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    backgroundColor: '#e0e0e0',
                                    color: '#666',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem'
                                }}>
                                    ID: {item.id}
                                </div>
                            </div>
                        ))}
                    </div>

                    {enhancedMenuItems.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '8px',
                            color: '#666'
                        }}>
                            <h3>No menu items found</h3>
                            <p>Click "Add New Item" to create your first menu item.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MenuManagement;
