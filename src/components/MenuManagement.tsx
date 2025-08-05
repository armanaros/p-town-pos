import React, { useState } from 'react';
import { MenuItem } from '../types';
import { useOrderContext } from '../context/OrderContext';

const MenuManagement: React.FC = () => {
    const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useOrderContext();
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', price: 0, cost: 0, category: '' });

    const handleAddItem = () => {
        if (formData.name.trim() && formData.price > 0) {
            addMenuItem({
                name: formData.name.trim(),
                price: formData.price,
                available: true,
                cost: formData.cost,
                category: formData.category
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
                available: editingItem.available,
                cost: formData.cost,
                category: formData.category
            });
            setEditingItem(null);
            setFormData({ name: '', price: 0, cost: 0, category: '' });
        }
    };

    const startEdit = (item: MenuItem) => {
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

    const handleDelete = (item: MenuItem) => {
        if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
            deleteMenuItem(item.id);
        }
    };

    return (
        <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Menu Management</h2>
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
                    <h3>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
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
                {menuItems.map(item => (
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

            {menuItems.length === 0 && (
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
    );
};

export default MenuManagement;
