import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../types';

const InventoryManagement: React.FC = () => {
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [lowStockAlerts, setLowStockAlerts] = useState<InventoryItem[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        currentStock: 0,
        minimumStock: 0,
        unit: '',
        costPerUnit: 0,
        sellingPrice: 0,
        supplier: '',
        expiryDate: ''
    });

    // Load data from localStorage
    useEffect(() => {
        const savedInventory = localStorage.getItem('inventory-items');

        if (savedInventory) {
            const items = JSON.parse(savedInventory);
            setInventoryItems(items);
            // Check for low stock alerts
            const lowStock = items.filter((item: InventoryItem) => item.currentStock <= item.minimumStock);
            setLowStockAlerts(lowStock);
        } else {
            // Demo data
            const demoInventory: InventoryItem[] = [
                {
                    id: 1,
                    name: 'Chicken Breast',
                    currentStock: 50,
                    minimumStock: 20,
                    unit: 'kg',
                    costPerUnit: 250,
                    sellingPrice: 350,
                    supplier: 'Fresh Meat Co.',
                    lastRestocked: new Date().toISOString(),
                    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 2,
                    name: 'Rice',
                    currentStock: 5,
                    minimumStock: 10,
                    unit: 'kg',
                    costPerUnit: 45,
                    sellingPrice: 65,
                    supplier: 'Grain Supplier',
                    lastRestocked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 3,
                    name: 'Cooking Oil',
                    currentStock: 15,
                    minimumStock: 5,
                    unit: 'liters',
                    costPerUnit: 120,
                    sellingPrice: 180,
                    supplier: 'Oil Company',
                    lastRestocked: new Date().toISOString()
                }
            ];
            setInventoryItems(demoInventory);
            setLowStockAlerts(demoInventory.filter(item => item.currentStock <= item.minimumStock));
        }
    }, []);

    // Save data to localStorage
    const saveInventoryData = (items: InventoryItem[]) => {
        localStorage.setItem('inventory-items', JSON.stringify(items));
    };

    const handleAddItem = () => {
        if (formData.name.trim() && formData.costPerUnit > 0 && formData.unit.trim()) {
            const newItem: InventoryItem = {
                id: Date.now(),
                name: formData.name.trim(),
                currentStock: formData.currentStock,
                minimumStock: formData.minimumStock,
                unit: formData.unit.trim(),
                costPerUnit: formData.costPerUnit,
                sellingPrice: formData.sellingPrice || undefined,
                supplier: formData.supplier.trim(),
                lastRestocked: new Date().toISOString(),
                expiryDate: formData.expiryDate || undefined
            };
            
            const updatedItems = [...inventoryItems, newItem];
            setInventoryItems(updatedItems);
            saveInventoryData(updatedItems);
            setFormData({
                name: '',
                currentStock: 0,
                minimumStock: 0,
                unit: '',
                costPerUnit: 0,
                sellingPrice: 0,
                supplier: '',
                expiryDate: ''
            });
            setShowAddForm(false);
            
            // Update low stock alerts
            const lowStock = updatedItems.filter(item => item.currentStock <= item.minimumStock);
            setLowStockAlerts(lowStock);
        }
    };

    const handleUpdateItem = () => {
        if (editingItem && formData.name.trim() && formData.costPerUnit > 0 && formData.unit.trim()) {
            const updatedItems = inventoryItems.map(item =>
                item.id === editingItem.id
                    ? {
                        ...item,
                        name: formData.name.trim(),
                        currentStock: formData.currentStock,
                        minimumStock: formData.minimumStock,
                        unit: formData.unit.trim(),
                        costPerUnit: formData.costPerUnit,
                        sellingPrice: formData.sellingPrice || undefined,
                        supplier: formData.supplier.trim(),
                        expiryDate: formData.expiryDate || undefined
                    }
                    : item
            );
            
            setInventoryItems(updatedItems);
            saveInventoryData(updatedItems);
            setEditingItem(null);
            setFormData({
                name: '',
                currentStock: 0,
                minimumStock: 0,
                unit: '',
                costPerUnit: 0,
                sellingPrice: 0,
                supplier: '',
                expiryDate: ''
            });
            
            // Update low stock alerts
            const lowStock = updatedItems.filter(item => item.currentStock <= item.minimumStock);
            setLowStockAlerts(lowStock);
        }
    };

    const startEdit = (item: InventoryItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            currentStock: item.currentStock,
            minimumStock: item.minimumStock,
            unit: item.unit,
            costPerUnit: item.costPerUnit,
            sellingPrice: item.sellingPrice || 0,
            supplier: item.supplier,
            expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : ''
        });
        setShowAddForm(false);
    };

    const cancelEdit = () => {
        setEditingItem(null);
        setShowAddForm(false);
        setFormData({
            name: '',
            currentStock: 0,
            minimumStock: 0,
            unit: '',
            costPerUnit: 0,
            sellingPrice: 0,
            supplier: '',
            expiryDate: ''
        });
    };

    const handleDelete = (item: InventoryItem) => {
        if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
            const updatedItems = inventoryItems.filter(i => i.id !== item.id);
            setInventoryItems(updatedItems);
            saveInventoryData(updatedItems);
            
            // Update low stock alerts
            const lowStock = updatedItems.filter(item => item.currentStock <= item.minimumStock);
            setLowStockAlerts(lowStock);
        }
    };

    const updateStock = (itemId: number, newStock: number) => {
        const updatedItems = inventoryItems.map(item =>
            item.id === itemId ? { ...item, currentStock: newStock, lastRestocked: new Date().toISOString() } : item
        );
        setInventoryItems(updatedItems);
        saveInventoryData(updatedItems);
        
        // Update low stock alerts
        const lowStock = updatedItems.filter(item => item.currentStock <= item.minimumStock);
        setLowStockAlerts(lowStock);
    };

    const getStockStatus = (item: InventoryItem) => {
        if (item.currentStock <= 0) return { status: 'out-of-stock', color: '#dc3545', text: 'Out of Stock' };
        if (item.currentStock <= item.minimumStock) return { status: 'low-stock', color: '#ffc107', text: 'Low Stock' };
        return { status: 'in-stock', color: '#28a745', text: 'In Stock' };
    };

    const getProfitMargin = (item: InventoryItem) => {
        if (!item.sellingPrice || item.sellingPrice <= 0) return null;
        return ((item.sellingPrice - item.costPerUnit) / item.sellingPrice * 100);
    };

    return (
        <div style={{ padding: '1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Inventory Management</h2>
                <button
                    onClick={() => {
                        setShowAddForm(true);
                        setEditingItem(null);
                        setFormData({
                            name: '',
                            currentStock: 0,
                            minimumStock: 0,
                            unit: '',
                            costPerUnit: 0,
                            sellingPrice: 0,
                            supplier: '',
                            expiryDate: ''
                        });
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
            </div>

            {/* Add/Edit Form */}
            {(showAddForm || editingItem) && (
                <div style={{
                    backgroundColor: '#f9f9f9',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                    border: '2px solid #4caf50'
                }}>
                    <h3>{editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
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
                                Unit:
                            </label>
                            <select
                                value={formData.unit}
                                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="">Select Unit</option>
                                <option value="kg">Kilograms (kg)</option>
                                <option value="g">Grams (g)</option>
                                <option value="liters">Liters</option>
                                <option value="ml">Milliliters (ml)</option>
                                <option value="pieces">Pieces</option>
                                <option value="packs">Packs</option>
                                <option value="boxes">Boxes</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Current Stock:
                            </label>
                            <input
                                type="number"
                                value={formData.currentStock}
                                onChange={(e) => setFormData(prev => ({ ...prev, currentStock: parseInt(e.target.value) || 0 }))}
                                placeholder="0"
                                min="0"
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
                                Minimum Stock:
                            </label>
                            <input
                                type="number"
                                value={formData.minimumStock}
                                onChange={(e) => setFormData(prev => ({ ...prev, minimumStock: parseInt(e.target.value) || 0 }))}
                                placeholder="0"
                                min="0"
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
                                Cost per Unit (₱):
                            </label>
                            <input
                                type="number"
                                value={formData.costPerUnit}
                                onChange={(e) => setFormData(prev => ({ ...prev, costPerUnit: parseFloat(e.target.value) || 0 }))}
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
                                Selling Price (₱):
                            </label>
                            <input
                                type="number"
                                value={formData.sellingPrice}
                                onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
                                placeholder="0.00 (optional)"
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
                                Supplier:
                            </label>
                            <input
                                type="text"
                                value={formData.supplier}
                                onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                                placeholder="Supplier name"
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
                                Expiry Date (optional):
                            </label>
                            <input
                                type="date"
                                value={formData.expiryDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
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
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
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
                        {formData.sellingPrice > 0 && formData.costPerUnit > 0 && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.75rem',
                                backgroundColor: '#e3f2fd',
                                borderRadius: '4px',
                                fontSize: '0.9rem',
                                color: '#1976d2'
                            }}>
                                Profit Margin: {(((formData.sellingPrice - formData.costPerUnit) / formData.sellingPrice) * 100).toFixed(1)}%
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Low Stock Alerts */}
            {lowStockAlerts.length > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                    boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)'
                }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center' }}>
                        ⚠️ Low Stock Alerts ({lowStockAlerts.length})
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {lowStockAlerts.map(item => (
                            <span key={item.id} style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '15px',
                                fontSize: '0.9rem'
                            }}>
                                {item.name}: {item.currentStock} {item.unit}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Inventory Items Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                {inventoryItems.map(item => {
                    const stockStatus = getStockStatus(item);
                    const profitMargin = getProfitMargin(item);
                    return (
                        <div key={item.id} style={{
                            border: '1px solid #ddd',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            backgroundColor: 'white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            position: 'relative'
                        }}>
                            {/* Stock Status Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: stockStatus.color,
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '15px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>
                                {stockStatus.text}
                            </div>

                            <h3 style={{ margin: '0 0 1rem 0', color: '#333', paddingRight: '5rem' }}>
                                {item.name}
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                                <div>
                                    <strong>Current Stock:</strong><br />
                                    <span style={{ fontSize: '1.2rem', color: stockStatus.color, fontWeight: 'bold' }}>
                                        {item.currentStock} {item.unit}
                                    </span>
                                </div>
                                <div>
                                    <strong>Minimum Stock:</strong><br />
                                    {item.minimumStock} {item.unit}
                                </div>
                                <div>
                                    <strong>Cost per Unit:</strong><br />
                                    ₱{item.costPerUnit.toFixed(2)}
                                </div>
                                {item.sellingPrice && (
                                    <div>
                                        <strong>Selling Price:</strong><br />
                                        ₱{item.sellingPrice.toFixed(2)}
                                    </div>
                                )}
                                <div>
                                    <strong>Total Value:</strong><br />
                                    ₱{(item.currentStock * item.costPerUnit).toFixed(2)}
                                </div>
                                {item.sellingPrice && profitMargin !== null && (
                                    <div>
                                        <strong>Profit Margin:</strong><br />
                                        <span style={{ 
                                            color: profitMargin >= 20 ? '#4caf50' : profitMargin >= 10 ? '#ff9800' : '#f44336',
                                            fontWeight: 'bold'
                                        }}>
                                            {profitMargin.toFixed(1)}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                <div><strong>Supplier:</strong> {item.supplier}</div>
                                <div><strong>Last Restocked:</strong> {new Date(item.lastRestocked).toLocaleDateString()}</div>
                                {item.expiryDate && (
                                    <div><strong>Expires:</strong> {new Date(item.expiryDate).toLocaleDateString()}</div>
                                )}
                            </div>

                            {/* Stock Adjustment */}
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                                <button
                                    onClick={() => updateStock(item.id, Math.max(0, item.currentStock - 1))}
                                    style={{
                                        padding: '0.5rem',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ➖
                                </button>
                                <input
                                    type="number"
                                    value={item.currentStock}
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
                                    onClick={() => updateStock(item.id, item.currentStock + 1)}
                                    style={{
                                        padding: '0.5rem',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ➕
                                </button>
                                <span style={{ fontSize: '0.9rem', color: '#666' }}>
                                    {item.unit}
                                </span>
                            </div>

                            {/* Action Buttons */}
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
                                bottom: '0.5rem',
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
                    );
                })}
            </div>

            {inventoryItems.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    color: '#666'
                }}>
                    <h3>No inventory items found</h3>
                    <p>Click "Add New Item" to create your first inventory item.</p>
                </div>
            )}
        </div>
    );
};

export default InventoryManagement;
