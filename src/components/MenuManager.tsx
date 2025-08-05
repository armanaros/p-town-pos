import React, { useState, useEffect } from 'react';

interface MenuItem {
    id: number;
    name: string;
    price: number;
    category: string;
    available: boolean;
    description?: string;
    image?: string;
}

interface ComboItem {
    id: number;
    name: string;
    items: number[]; // Array of menu item IDs
    price: number;
    discount: number; // Percentage discount
    available: boolean;
    description: string;
}

interface Category {
    id: string;
    name: string;
    color: string;
    icon: string;
}

const MenuManager: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [comboItems, setComboItems] = useState<ComboItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeSection, setActiveSection] = useState<'items' | 'combos' | 'categories'>('items');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form states
    const [newItem, setNewItem] = useState<Partial<MenuItem>>({
        name: '',
        price: 0,
        category: '',
        available: true,
        description: ''
    });

    const [newCombo, setNewCombo] = useState<Partial<ComboItem>>({
        name: '',
        items: [],
        price: 0,
        discount: 0,
        available: true,
        description: ''
    });

    // Load data from localStorage
    useEffect(() => {
        const savedItems = localStorage.getItem('menuItems');
        const savedCombos = localStorage.getItem('comboItems');
        const savedCategories = localStorage.getItem('categories');

        if (savedItems) {
            setMenuItems(JSON.parse(savedItems));
        } else {
            // Default menu items
            const defaultItems: MenuItem[] = [
                { id: 1, name: 'Burger', price: 150, category: 'mains', available: true, description: 'Juicy beef burger with fresh vegetables' },
                { id: 2, name: 'Pizza', price: 300, category: 'mains', available: true, description: 'Wood-fired pizza with premium toppings' },
                { id: 3, name: 'Fries', price: 80, category: 'sides', available: true, description: 'Crispy golden fries' },
                { id: 4, name: 'Soda', price: 50, category: 'drinks', available: true, description: 'Refreshing carbonated drink' },
                { id: 5, name: 'Chicken', price: 120, category: 'mains', available: true, description: 'Grilled chicken breast' },
                { id: 6, name: 'Rice', price: 25, category: 'sides', available: true, description: 'Steamed jasmine rice' },
                { id: 7, name: 'Salad', price: 90, category: 'sides', available: true, description: 'Fresh garden salad' },
                { id: 8, name: 'Coffee', price: 60, category: 'drinks', available: true, description: 'Premium roasted coffee' }
            ];
            setMenuItems(defaultItems);
            localStorage.setItem('menuItems', JSON.stringify(defaultItems));
        }

        if (savedCombos) {
            setComboItems(JSON.parse(savedCombos));
        }

        if (savedCategories) {
            setCategories(JSON.parse(savedCategories));
        } else {
            // Default categories
            const defaultCategories: Category[] = [
                { id: 'mains', name: 'Main Dishes', color: '#3b82f6', icon: '🍽️' },
                { id: 'sides', name: 'Sides', color: '#10b981', icon: '🍟' },
                { id: 'drinks', name: 'Beverages', color: '#f59e0b', icon: '🥤' },
                { id: 'desserts', name: 'Desserts', color: '#ec4899', icon: '🍰' }
            ];
            setCategories(defaultCategories);
            localStorage.setItem('categories', JSON.stringify(defaultCategories));
        }
    }, []);

    // Save to localStorage
    const saveMenuItems = (items: MenuItem[]) => {
        localStorage.setItem('menuItems', JSON.stringify(items));
        setMenuItems(items);
    };

    const saveComboItems = (combos: ComboItem[]) => {
        localStorage.setItem('comboItems', JSON.stringify(combos));
        setComboItems(combos);
    };

    const saveCategories = (cats: Category[]) => {
        localStorage.setItem('categories', JSON.stringify(cats));
        setCategories(cats);
    };

    // Generate unique ID
    const generateId = () => {
        return Date.now() + Math.floor(Math.random() * 1000);
    };

    // Menu item operations
    const handleAddItem = () => {
        if (!newItem.name || !newItem.price || !newItem.category) {
            alert('Please fill in all required fields');
            return;
        }

        const item: MenuItem = {
            id: generateId(),
            name: newItem.name,
            price: newItem.price,
            category: newItem.category,
            available: newItem.available ?? true,
            description: newItem.description || ''
        };

        saveMenuItems([...menuItems, item]);
        setNewItem({ name: '', price: 0, category: '', available: true, description: '' });
        setShowAddForm(false);
    };

    const handleEditItem = (item: MenuItem) => {
        setEditingItem(item);
        setNewItem(item);
        setShowAddForm(true);
    };

    const handleUpdateItem = () => {
        if (!editingItem || !newItem.name || !newItem.price || !newItem.category) {
            alert('Please fill in all required fields');
            return;
        }

        const updatedItems = menuItems.map(item => 
            item.id === editingItem.id 
                ? { ...editingItem, ...newItem } 
                : item
        );

        saveMenuItems(updatedItems);
        setEditingItem(null);
        setNewItem({ name: '', price: 0, category: '', available: true, description: '' });
        setShowAddForm(false);
    };

    const handleDeleteItem = (id: number) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            saveMenuItems(menuItems.filter(item => item.id !== id));
        }
    };

    const toggleItemAvailability = (id: number) => {
        const updatedItems = menuItems.map(item => 
            item.id === id ? { ...item, available: !item.available } : item
        );
        saveMenuItems(updatedItems);
    };

    // Filter items
    const filteredItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Get category info
    const getCategoryInfo = (categoryId: string) => {
        return categories.find(cat => cat.id === categoryId) || { name: categoryId, color: '#64748b', icon: '📋' };
    };

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '15px',
            padding: '1.5rem',
            border: '1px solid rgba(226, 232, 240, 0.5)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
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
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    margin: 0
                }}>
                    🍽️ Enhanced Menu Management
                </h2>
                <button
                    onClick={() => setShowAddForm(true)}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                    }}
                >
                    ➕ Add New Item
                </button>
            </div>

            {/* Section Navigation */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                padding: '0.5rem',
                background: 'rgba(148, 163, 184, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
                <button
                    onClick={() => setActiveSection('items')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: activeSection === 'items' 
                            ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' 
                            : 'transparent',
                        color: activeSection === 'items' ? 'white' : '#475569',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                    }}
                >
                    🍽️ Menu Items ({menuItems.length})
                </button>
                <button
                    onClick={() => setActiveSection('combos')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: activeSection === 'combos' 
                            ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' 
                            : 'transparent',
                        color: activeSection === 'combos' ? 'white' : '#475569',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                    }}
                >
                    🎁 Combo Deals ({comboItems.length})
                </button>
                <button
                    onClick={() => setActiveSection('categories')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: activeSection === 'categories' 
                            ? 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' 
                            : 'transparent',
                        color: activeSection === 'categories' ? 'white' : '#475569',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                    }}
                >
                    📂 Categories ({categories.length})
                </button>
            </div>

            {activeSection === 'items' && (
                <div>
                    {/* Search and Filter Controls */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                        alignItems: 'center'
                    }}>
                        <input
                            type="text"
                            placeholder="🔍 Search menu items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '0.75rem 1rem',
                                border: '2px solid rgba(148, 163, 184, 0.2)',
                                borderRadius: '10px',
                                fontSize: '0.95rem',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                        />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{
                                padding: '0.75rem 1rem',
                                border: '2px solid rgba(148, 163, 184, 0.2)',
                                borderRadius: '10px',
                                fontSize: '0.95rem',
                                background: 'white',
                                minWidth: '150px'
                            }}
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Menu Items Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}>
                        {filteredItems.map(item => {
                            const categoryInfo = getCategoryInfo(item.category);
                            return (
                                <div
                                    key={item.id}
                                    style={{
                                        background: item.available 
                                            ? 'rgba(255, 255, 255, 0.9)' 
                                            : 'rgba(148, 163, 184, 0.1)',
                                        border: `2px solid ${item.available ? categoryInfo.color + '40' : 'rgba(148, 163, 184, 0.3)'}`,
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        transition: 'all 0.3s ease',
                                        opacity: item.available ? 1 : 0.6
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '0.75rem'
                                    }}>
                                        <div>
                                            <h3 style={{
                                                color: '#1e293b',
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                margin: '0 0 0.25rem 0'
                                            }}>
                                                {item.name}
                                            </h3>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                background: categoryInfo.color + '20',
                                                color: categoryInfo.color,
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600'
                                            }}>
                                                {categoryInfo.icon} {categoryInfo.name}
                                            </div>
                                        </div>
                                        <div style={{
                                            color: '#1e293b',
                                            fontSize: '1.2rem',
                                            fontWeight: 'bold'
                                        }}>
                                            ₱{item.price}
                                        </div>
                                    </div>

                                    {item.description && (
                                        <p style={{
                                            color: '#64748b',
                                            fontSize: '0.9rem',
                                            margin: '0 0 1rem 0',
                                            lineHeight: 1.4
                                        }}>
                                            {item.description}
                                        </p>
                                    )}

                                    <div style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                        alignItems: 'center'
                                    }}>
                                        <button
                                            onClick={() => toggleItemAvailability(item.id)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: item.available 
                                                    ? 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' 
                                                    : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                flex: 1
                                            }}
                                        >
                                            {item.available ? '🚫 Disable' : '✅ Enable'}
                                        </button>
                                        <button
                                            onClick={() => handleEditItem(item)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredItems.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            color: '#64748b',
                            fontSize: '1.1rem',
                            padding: '3rem 1rem',
                            background: 'rgba(148, 163, 184, 0.05)',
                            borderRadius: '12px',
                            border: '2px dashed rgba(148, 163, 184, 0.3)'
                        }}>
                            {searchTerm ? '🔍 No items found matching your search' : '📝 No items in this category'}
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Item Modal */}
            {showAddForm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '15px',
                        padding: '2rem',
                        width: '90%',
                        maxWidth: '500px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                    }}>
                        <h3 style={{
                            color: '#1e293b',
                            fontSize: '1.3rem',
                            fontWeight: '700',
                            marginBottom: '1.5rem'
                        }}>
                            {editingItem ? '✏️ Edit Menu Item' : '➕ Add New Menu Item'}
                        </h3>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    color: '#374151',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem'
                                }}>
                                    Item Name *
                                </label>
                                <input
                                    type="text"
                                    value={newItem.name || ''}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid rgba(148, 163, 184, 0.2)',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                    placeholder="Enter item name"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        color: '#374151',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Price (₱) *
                                    </label>
                                    <input
                                        type="number"
                                        value={newItem.price || ''}
                                        onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid rgba(148, 163, 184, 0.2)',
                                            borderRadius: '8px',
                                            fontSize: '0.95rem',
                                            outline: 'none'
                                        }}
                                        placeholder="0"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        color: '#374151',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Category *
                                    </label>
                                    <select
                                        value={newItem.category || ''}
                                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid rgba(148, 163, 184, 0.2)',
                                            borderRadius: '8px',
                                            fontSize: '0.95rem',
                                            background: 'white'
                                        }}
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.icon} {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    color: '#374151',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem'
                                }}>
                                    Description
                                </label>
                                <textarea
                                    value={newItem.description || ''}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid rgba(148, 163, 184, 0.2)',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        resize: 'vertical',
                                        minHeight: '80px'
                                    }}
                                    placeholder="Optional description..."
                                />
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <input
                                    type="checkbox"
                                    id="available"
                                    checked={newItem.available ?? true}
                                    onChange={(e) => setNewItem({ ...newItem, available: e.target.checked })}
                                    style={{
                                        width: '18px',
                                        height: '18px'
                                    }}
                                />
                                <label htmlFor="available" style={{
                                    color: '#374151',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}>
                                    Available for ordering
                                </label>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginTop: '2rem',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingItem(null);
                                    setNewItem({ name: '', price: 0, category: '', available: true, description: '' });
                                }}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'rgba(148, 163, 184, 0.1)',
                                    color: '#475569',
                                    border: '2px solid rgba(148, 163, 184, 0.2)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    fontWeight: '600'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={editingItem ? handleUpdateItem : handleAddItem}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    fontWeight: '600'
                                }}
                            >
                                {editingItem ? 'Update Item' : 'Add Item'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuManager;
