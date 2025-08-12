import React, { useState, useEffect } from 'react';
import { dataService } from '../utils/dataService';
import { useOrderContext } from '../context/OrderContext';

interface Cashier {
    id: string;
    name: string;
    username: string;
    password: string;
    role: 'cashier' | 'waiter' | 'manager';
    dailyPay?: number;
    createdAt: string;
}

interface Expense {
    id: string;
    description: string;
    amount: number;
    category: 'utilities' | 'supplies' | 'maintenance' | 'food' | 'other';
    date: string;
    createdAt: string;
}

const CashierManagement: React.FC = () => {
    const { getTodaysSales } = useOrderContext();
    const [cashiers, setCashiers] = useState<Cashier[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [showAddCashier, setShowAddCashier] = useState(false);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [editingCashier, setEditingCashier] = useState<Cashier | null>(null);
    const [activeTab, setActiveTab] = useState<'employees' | 'expenses' | 'financial'>('employees');
    const [newCashier, setNewCashier] = useState({ 
        name: '', 
        username: '', 
        password: '', 
        role: 'cashier' as 'cashier' | 'waiter' | 'manager',
        dailyPay: 0
    });
    const [newExpense, setNewExpense] = useState({
        description: '',
        amount: 0,
        category: 'other' as 'utilities' | 'supplies' | 'maintenance' | 'food' | 'other',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        // Fetch cashiers from Firebase
        dataService.getCashiers().then(setCashiers);
        // ...existing code for expenses (if needed)...
    }, []);

    const saveCashiers = (updatedCashiers: Cashier[]) => {
    setCashiers(updatedCashiers);
    // No localStorage, sync to Firebase
    // This function is now only used for UI state
    };

    const saveExpenses = (updatedExpenses: Expense[]) => {
        setExpenses(updatedExpenses);
        localStorage.setItem('p-town-expenses', JSON.stringify(updatedExpenses));
    };

    const handleAddCashier = () => {
        if (!newCashier.name.trim() || !newCashier.username.trim() || !newCashier.password.trim()) {
            alert('Please enter name, username and password');
            return;
        }

        if (newCashier.dailyPay <= 0) {
            alert('Please enter a valid daily pay amount');
            return;
        }

        if (cashiers.some(c => c.username === newCashier.username)) {
            alert('Username already exists');
            return;
        }

        const cashier = {
            name: newCashier.name.trim(),
            username: newCashier.username.trim(),
            password: newCashier.password.trim(),
            role: newCashier.role,
            dailyPay: newCashier.dailyPay
        };
        dataService.createCashier(cashier).then(() => {
            dataService.getCashiers().then(setCashiers);
            setNewCashier({ name: '', username: '', password: '', role: 'cashier', dailyPay: 0 });
            setShowAddCashier(false);
        });
    };

    const handleDeleteCashier = (id: string) => {
        if (window.confirm('Are you sure you want to delete this employee account?')) {
            dataService.deleteCashier(id).then(() => {
                dataService.getCashiers().then(setCashiers);
            });
        }
    };

    const handleEditCashier = (cashier: Cashier) => {
        setEditingCashier(cashier);
        setNewCashier({
            name: cashier.name,
            username: cashier.username,
            password: cashier.password,
            role: cashier.role,
            dailyPay: cashier.dailyPay ?? 0
        });
        setShowAddCashier(true);
    };

    const handleUpdateCashier = () => {
        if (!editingCashier) return;

        if (!newCashier.name.trim() || !newCashier.username.trim() || !newCashier.password.trim()) {
            alert('Please enter name, username and password');
            return;
        }

        if (newCashier.dailyPay <= 0) {
            alert('Please enter a valid daily pay amount');
            return;
        }

        // Check if username exists for other cashiers
        if (cashiers.some(c => c.username === newCashier.username && c.id !== editingCashier.id)) {
            alert('Username already exists');
            return;
        }

        const updatedCashier = {
            ...editingCashier,
            name: newCashier.name.trim(),
            username: newCashier.username.trim(),
            password: newCashier.password.trim(),
            role: newCashier.role,
            dailyPay: newCashier.dailyPay
        };
        dataService.updateCashier(updatedCashier.id, updatedCashier).then(() => {
            dataService.getCashiers().then(setCashiers);
            setNewCashier({ name: '', username: '', password: '', role: 'cashier', dailyPay: 0 });
            setEditingCashier(null);
            setShowAddCashier(false);
        });
    };

    const cancelCashierEdit = () => {
        setEditingCashier(null);
        setNewCashier({ name: '', username: '', password: '', role: 'cashier', dailyPay: 0 });
        setShowAddCashier(false);
    };

    const handleAddExpense = () => {
        if (!newExpense.description.trim() || newExpense.amount <= 0) {
            alert('Please enter description and amount');
            return;
        }

        const expense: Expense = {
            id: Date.now().toString(),
            description: newExpense.description.trim(),
            amount: newExpense.amount,
            category: newExpense.category,
            date: newExpense.date,
            createdAt: new Date().toISOString()
        };

        saveExpenses([...expenses, expense]);
        setNewExpense({
            description: '',
            amount: 0,
            category: 'other',
            date: new Date().toISOString().split('T')[0]
        });
        setShowAddExpense(false);
    };

    const handleDeleteExpense = (id: string) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            saveExpenses(expenses.filter(e => e.id !== id));
        }
    };

    const getTotalExpenses = () => {
        return expenses.reduce((total, expense) => total + expense.amount, 0);
    };

    const getTodayExpenses = () => {
        const today = new Date().toISOString().split('T')[0];
        return expenses
            .filter(expense => expense.date === today)
            .reduce((total, expense) => total + expense.amount, 0);
    };

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <h2 style={{ 
                    fontSize: '1.8rem', 
                    fontWeight: 'bold',
                    color: '#1f2937',
                    margin: 0
                }}>
                    👥 Employee & Expense Management
                </h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {activeTab !== 'financial' && (
                        <button
                            onClick={() => {
                                if (activeTab === 'employees') {
                                    setEditingCashier(null);
                                    setShowAddCashier(true);
                                    setNewCashier({ name: '', username: '', password: '', role: 'cashier', dailyPay: 0 });
                                } else {
                                    setShowAddExpense(true);
                                }
                            }}
                            style={{
                                padding: '0.75rem 1.25rem',
                                background: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(6, 182, 212, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(6, 182, 212, 0.3)';
                            }}
                        >
                            ➕ Add New {activeTab === 'employees' ? 'Employee' : 'Expense'}
                        </button>
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0' }}>
                    <button
                        onClick={() => setActiveTab('employees')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: activeTab === 'employees' ? '#06b6d4' : '#e9ecef',
                            color: activeTab === 'employees' ? 'white' : '#495057',
                            border: '1px solid #dee2e6',
                            borderRadius: '8px 0 0 8px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: activeTab === 'employees' ? 'bold' : 'normal'
                        }}
                    >
                        👥 Employees ({cashiers.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('expenses')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: activeTab === 'expenses' ? '#06b6d4' : '#e9ecef',
                            color: activeTab === 'expenses' ? 'white' : '#495057',
                            border: '1px solid #dee2e6',
                            borderLeft: 'none',
                            borderRadius: '0',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: activeTab === 'expenses' ? 'bold' : 'normal'
                        }}
                    >
                        💰 Expenses (₱{getTotalExpenses().toFixed(2)})
                    </button>
                    <button
                        onClick={() => setActiveTab('financial')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: activeTab === 'financial' ? '#06b6d4' : '#e9ecef',
                            color: activeTab === 'financial' ? 'white' : '#495057',
                            border: '1px solid #dee2e6',
                            borderLeft: 'none',
                            borderRadius: '0 8px 8px 0',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: activeTab === 'financial' ? 'bold' : 'normal'
                        }}
                    >
                        📊 Financial Summary
                    </button>
                </div>
            </div>

            {/* Add Employee Form */}
            {showAddCashier && activeTab === 'employees' && (
                <div style={{
                    background: 'rgba(6, 182, 212, 0.05)',
                    border: '2px solid rgba(6, 182, 212, 0.2)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <h3 style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: '600',
                        color: '#0891b2',
                        marginBottom: '1rem'
                    }}>
                        {editingCashier ? '✏️ Edit Employee' : '➕ Add New Employee'}
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={newCashier.name}
                                onChange={(e) => setNewCashier({ ...newCashier, name: e.target.value })}
                                placeholder="Enter full name"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid rgba(6, 182, 212, 0.2)',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Username
                            </label>
                            <input
                                type="text"
                                value={newCashier.username}
                                onChange={(e) => setNewCashier({ ...newCashier, username: e.target.value })}
                                placeholder="Enter username"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid rgba(6, 182, 212, 0.2)',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={newCashier.password}
                                onChange={(e) => setNewCashier({ ...newCashier, password: e.target.value })}
                                placeholder="Enter password"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid rgba(6, 182, 212, 0.2)',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Role
                            </label>
                            <select
                                value={newCashier.role}
                                onChange={(e) => setNewCashier({ ...newCashier, role: e.target.value as 'cashier' | 'waiter' | 'manager' })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid rgba(6, 182, 212, 0.2)',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    boxSizing: 'border-box',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="cashier">💰 Cashier</option>
                                <option value="waiter">🍽️ Waiter</option>
                                <option value="manager">👔 Manager</option>
                            </select>
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Daily Pay (₱)
                            </label>
                            <input
                                type="number"
                                value={newCashier.dailyPay}
                                onChange={(e) => setNewCashier({ ...newCashier, dailyPay: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid rgba(6, 182, 212, 0.2)',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            onClick={editingCashier ? handleUpdateCashier : handleAddCashier}
                            style={{
                                padding: '0.75rem 1.25rem',
                                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                            }}
                        >
                            {editingCashier ? '✅ Update Employee' : '✅ Add Employee'}
                        </button>
                        <button
                            onClick={editingCashier ? cancelCashierEdit : () => {
                                setShowAddCashier(false);
                                setNewCashier({ name: '', username: '', password: '', role: 'cashier', dailyPay: 0 });
                            }}
                            style={{
                                padding: '0.75rem 1.25rem',
                                background: 'rgba(148, 163, 184, 0.2)',
                                color: '#475569',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600'
                            }}
                        >
                            ❌ Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Add Expense Form */}
            {showAddExpense && activeTab === 'expenses' && (
                <div style={{
                    background: 'rgba(220, 38, 38, 0.05)',
                    border: '2px solid rgba(220, 38, 38, 0.2)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <h3 style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: '600',
                        color: '#dc2626',
                        marginBottom: '1rem'
                    }}>
                        Add New Expense
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Description
                            </label>
                            <input
                                type="text"
                                value={newExpense.description}
                                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                placeholder="Enter expense description"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid rgba(220, 38, 38, 0.2)',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Amount (₱)
                            </label>
                            <input
                                type="number"
                                value={newExpense.amount}
                                onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid rgba(220, 38, 38, 0.2)',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Category
                            </label>
                            <select
                                value={newExpense.category}
                                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as any })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid rgba(220, 38, 38, 0.2)',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    boxSizing: 'border-box',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="utilities">⚡ Utilities</option>
                                <option value="supplies">📦 Supplies</option>
                                <option value="maintenance">🔧 Maintenance</option>
                                <option value="food">🍽️ Food</option>
                                <option value="other">📋 Other</option>
                            </select>
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }}>
                                Date
                            </label>
                            <input
                                type="date"
                                value={newExpense.date}
                                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid rgba(220, 38, 38, 0.2)',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            onClick={handleAddExpense}
                            style={{
                                padding: '0.75rem 1.25rem',
                                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
                            }}
                        >
                            ✅ Add Expense
                        </button>
                        <button
                            onClick={() => {
                                setShowAddExpense(false);
                                setNewExpense({
                                    description: '',
                                    amount: 0,
                                    category: 'other',
                                    date: new Date().toISOString().split('T')[0]
                                });
                            }}
                            style={{
                                padding: '0.75rem 1.25rem',
                                background: 'rgba(148, 163, 184, 0.2)',
                                color: '#475569',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600'
                            }}
                        >
                            ❌ Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Employee List */}
            {activeTab === 'employees' && (
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
                <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '1.5rem',
                    borderBottom: '2px solid #e5e7eb',
                    paddingBottom: '0.5rem'
                }}>
                    📋 Employee List ({cashiers.length})
                </h3>
                {cashiers.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem 1rem',
                        color: '#6b7280',
                        fontSize: '1rem'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>No employees found</div>
                        <div>Click "Add New Employee" to create your first employee account.</div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {cashiers.map(cashier => (
                            <div key={cashier.id} style={{
                                background: 'white',
                                border: '2px solid rgba(6, 182, 212, 0.1)',
                                borderRadius: '12px',
                                padding: '1.25rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                            }}>
                                <div>
                                    <div style={{
                                        fontSize: '1.2rem',
                                        fontWeight: '600',
                                        color: '#1f2937',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {(cashier.role || 'cashier') === 'cashier' ? '💰' : 
                                         (cashier.role === 'waiter' ? '🍽️' : '👔')} {cashier.name}
                                    </div>
                                    <div style={{
                                        fontSize: '0.95rem',
                                        color: '#6b7280',
                                        marginBottom: '0.25rem'
                                    }}>
                                        Username: {cashier.username}
                                    </div>
                                    <div style={{
                                        fontSize: '0.95rem',
                                        color: (cashier.role || 'cashier') === 'cashier' ? '#059669' : 
                                               (cashier.role === 'waiter' ? '#7c3aed' : '#dc2626'),
                                        marginBottom: '0.25rem',
                                        fontWeight: '600'
                                    }}>
                                        Role: {(cashier.role || 'cashier') === 'cashier' ? '💰 Cashier' : 
                                               (cashier.role === 'waiter' ? '🍽️ Waiter' : '👔 Manager')}
                                    </div>
                                    <div style={{
                                        fontSize: '0.95rem',
                                        color: '#dc2626',
                                        marginBottom: '0.25rem',
                                        fontWeight: '600'
                                    }}>
                                        Daily Pay: ₱{(cashier.dailyPay || 0).toFixed(2)}
                                    </div>
                                    <div style={{
                                        fontSize: '0.9rem',
                                        color: '#6b7280'
                                    }}>
                                        Created: {new Date(cashier.createdAt).toLocaleDateString()}
                                    </div>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: '#9ca3af',
                                        marginTop: '0.25rem'
                                    }}>
                                        Password: {'•'.repeat(cashier.password.length)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleEditCashier(cashier)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCashier(cashier.id)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            )}

            {/* Expense List */}
            {activeTab === 'expenses' && (
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{
                        fontSize: '1.3rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: 0,
                        borderBottom: '2px solid #e5e7eb',
                        paddingBottom: '0.5rem'
                    }}>
                        💰 Expense Tracking
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                        <div style={{ padding: '0.5rem 1rem', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#991b1b' }}>
                            Today: ₱{getTodayExpenses().toFixed(2)}
                        </div>
                        <div style={{ padding: '0.5rem 1rem', backgroundColor: '#fef3c7', borderRadius: '8px', color: '#92400e' }}>
                            Total: ₱{getTotalExpenses().toFixed(2)}
                        </div>
                    </div>
                </div>
                
                {expenses.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem 1rem',
                        color: '#6b7280',
                        fontSize: '1rem'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>No expenses found</div>
                        <div>Click "Add New Expense" to start tracking your expenses.</div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {expenses
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map(expense => {
                                const categoryIcons = {
                                    utilities: '⚡',
                                    supplies: '📦',
                                    maintenance: '🔧',
                                    food: '🍽️',
                                    other: '📋'
                                };
                                
                                return (
                                    <div key={expense.id} style={{
                                        background: 'white',
                                        border: '2px solid rgba(220, 38, 38, 0.1)',
                                        borderRadius: '12px',
                                        padding: '1.25rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                color: '#1f2937',
                                                marginBottom: '0.5rem'
                                            }}>
                                                {categoryIcons[expense.category]} {expense.description}
                                            </div>
                                            <div style={{
                                                fontSize: '0.9rem',
                                                color: '#6b7280',
                                                marginBottom: '0.25rem'
                                            }}>
                                                Category: {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                                            </div>
                                            <div style={{
                                                fontSize: '0.9rem',
                                                color: '#6b7280'
                                            }}>
                                                Date: {new Date(expense.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                fontSize: '1.5rem',
                                                fontWeight: 'bold',
                                                color: '#dc2626'
                                            }}>
                                                -₱{expense.amount.toFixed(2)}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteExpense(expense.id)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>
            )}

            {/* Financial Summary Tab */}
            {activeTab === 'financial' && (
                <div>
                    {/* Financial Overview Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem'
                    }}>
                        {/* Daily Income Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            color: 'white',
                            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>💰</span>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Daily Income</h3>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                                ₱{getTodaysSales().toFixed(2)}
                            </div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                From completed orders
                            </div>
                        </div>

                        {/* Total Expenses Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            color: 'white',
                            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>💸</span>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Total Expenses</h3>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                                ₱{getTotalExpenses().toFixed(2)}
                            </div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                Today's operational costs
                            </div>
                        </div>

                        {/* Net Earnings Card */}
                        <div style={{
                            background: `linear-gradient(135deg, ${getTodaysSales() - getTotalExpenses() >= 0 ? '#3b82f6 0%, #60a5fa 100%' : '#f59e0b 0%, #fbbf24 100%'})`,
                            borderRadius: '16px',
                            padding: '1.5rem',
                            color: 'white',
                            boxShadow: `0 4px 20px ${getTodaysSales() - getTotalExpenses() >= 0 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>{getTodaysSales() - getTotalExpenses() >= 0 ? '📈' : '⚠️'}</span>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Net Earnings</h3>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                                ₱{(getTodaysSales() - getTotalExpenses()).toFixed(2)}
                            </div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                Income - Expenses
                            </div>
                        </div>

                        {/* Employee Payroll Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            color: 'white',
                            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>👥</span>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Employee Payroll</h3>
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                                ₱{cashiers.reduce((total, cashier) => total + (cashier.dailyPay ?? 0), 0).toFixed(2)}
                            </div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                Total daily pay for {cashiers.length} employees
                            </div>
                        </div>
                    </div>

                    {/* Profit Analysis */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        marginBottom: '2rem'
                    }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.3rem', fontWeight: 'bold', color: '#1f2937' }}>
                            📊 Financial Analysis
                        </h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                    AFTER PAYROLL
                                </div>
                                <div style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: 'bold', 
                                    color: (getTodaysSales() - getTotalExpenses() - cashiers.reduce((total, cashier) => total + (cashier.dailyPay ?? 0), 0)) >= 0 ? '#10b981' : '#ef4444'
                                }}>
                                    ₱{(getTodaysSales() - getTotalExpenses() - cashiers.reduce((total, cashier) => total + (cashier.dailyPay ?? 0), 0)).toFixed(2)}
                                </div>
                            </div>
                            
                            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                    PROFIT MARGIN
                                </div>
                                <div style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: 'bold', 
                                    color: getTodaysSales() > 0 ? ((getTodaysSales() - getTotalExpenses()) / getTodaysSales() * 100) >= 20 ? '#10b981' : '#f59e0b' : '#64748b'
                                }}>
                                    {getTodaysSales() > 0 ? ((getTodaysSales() - getTotalExpenses()) / getTodaysSales() * 100).toFixed(1) : '0.0'}%
                                </div>
                            </div>
                            
                            <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                    PAYROLL RATIO
                                </div>
                                <div style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: 'bold', 
                                    color: getTodaysSales() > 0 ? (cashiers.reduce((total, cashier) => total + (cashier.dailyPay ?? 0), 0) / getTodaysSales() * 100) <= 30 ? '#10b981' : '#ef4444' : '#64748b'
                                }}>
                                    {getTodaysSales() > 0 ? (cashiers.reduce((total, cashier) => total + (cashier.dailyPay ?? 0), 0) / getTodaysSales() * 100).toFixed(1) : '0.0'}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Expense Breakdown */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.3rem', fontWeight: 'bold', color: '#1f2937' }}>
                            💰 Expense Breakdown by Category
                        </h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                            {['utilities', 'supplies', 'maintenance', 'food', 'other'].map(category => {
                                const categoryExpenses = expenses.filter(expense => 
                                    expense.category === category && 
                                    expense.date === new Date().toISOString().split('T')[0]
                                );
                                const categoryTotal = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
                                const categoryIcon = {
                                    utilities: '⚡',
                                    supplies: '📦',
                                    maintenance: '🔧',
                                    food: '🍖',
                                    other: '📋'
                                }[category];
                                
                                return (
                                    <div key={category} style={{
                                        textAlign: 'center',
                                        padding: '1rem',
                                        background: categoryTotal > 0 ? 'rgba(239, 68, 68, 0.1)' : '#f8fafc',
                                        borderRadius: '12px',
                                        border: categoryTotal > 0 ? '2px solid rgba(239, 68, 68, 0.2)' : '1px solid #e2e8f0'
                                    }}>
                                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{categoryIcon}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '600' }}>
                                            {category}
                                        </div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: categoryTotal > 0 ? '#ef4444' : '#64748b' }}>
                                            ₱{categoryTotal.toFixed(2)}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                            {categoryExpenses.length} items
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashierManagement;
