import React, { useState, useEffect } from 'react';
import { useOrderContext, OrderProvider } from './context/OrderContext';
import HomePage from './components/HomePage';
import AdminLogin from './components/AdminLogin';
import CashierLogin from './components/CashierLogin';
import CashierDashboard from './components/CashierDashboard';
import AdminDashboard from './components/AdminDashboard';
import './styles/main.css?v=2';

type UserRole = 'admin' | 'manager' | 'waiter' | 'cashier' | null;
type AppState = 'home' | 'login' | 'dashboard';

const AppContent = () => {
    const { getSalesData } = useOrderContext();
    const [currentState, setCurrentState] = useState<AppState>('home');
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cashierName, setCashierName] = useState<string>('');
    const [cashierId, setCashierId] = useState<string>('');
    const [cashierRole, setCashierRole] = useState<string>('');

    // Load authentication state from localStorage on component mount
    useEffect(() => {
        const savedAuth = localStorage.getItem('ptownAuth');
        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                if (authData.isAuthenticated && authData.userRole) {
                    setIsAuthenticated(true);
                    setUserRole(authData.userRole);
                    setCurrentState('dashboard');
                    if (authData.cashierName) setCashierName(authData.cashierName);
                    if (authData.cashierId) setCashierId(authData.cashierId);
                    if (authData.cashierRole) setCashierRole(authData.cashierRole);
                }
            } catch (error) {
                console.error('Error loading auth state:', error);
                localStorage.removeItem('ptownAuth');
            }
        }
        setLoading(false);
    }, []);

    const handleRoleSelection = (role: 'admin' | 'manager' | 'waiter' | 'cashier') => {
        setUserRole(role);
        setCurrentState('login');
    };

    const handleLogin = (authenticated: boolean, name?: string, id?: string, role?: string) => {
        setIsAuthenticated(authenticated);
        if (authenticated) {
            setCurrentState('dashboard');
            if (name) {
                setCashierName(name);
            }
            if (id) {
                setCashierId(id);
            }
            if (role) {
                setCashierRole(role);
            }
            
            // Save authentication state to localStorage
            const authData = {
                isAuthenticated: true,
                userRole: userRole,
                cashierName: name || '',
                cashierId: id || '',
                cashierRole: role || ''
            };
            localStorage.setItem('ptownAuth', JSON.stringify(authData));
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserRole(null);
        setCurrentState('home');
        setError(null);
        setCashierName('');
        setCashierId('');
        setCashierRole('');
        
        // Clear authentication state from localStorage
        localStorage.removeItem('ptownAuth');
    };

    const handleBackToHome = () => {
        setCurrentState('home');
        setUserRole(null);
        setIsAuthenticated(false);
        
        // Clear authentication state from localStorage
        localStorage.removeItem('ptownAuth');
    };

    useEffect(() => {
        // No need to fetch mock data anymore - using real data from context
        setLoading(false);
    }, [isAuthenticated, userRole]);

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '18px',
                color: '#666'
            }}>
                Loading...
            </div>
        );
    }

    // Render based on current state
    if (currentState === 'home') {
        return <HomePage onSelectRole={handleRoleSelection} />;
    }

    if (currentState === 'login') {
        if (userRole === 'admin') {
            return <AdminLogin onLogin={handleLogin} onBackToHome={handleBackToHome} />;
        } else if (userRole === 'manager') {
            return <AdminLogin onLogin={handleLogin} onBackToHome={handleBackToHome} />;
        } else if (userRole === 'waiter') {
            return <CashierLogin onLogin={handleLogin} onBackToHome={handleBackToHome} />;
        } else if (userRole === 'cashier') {
            return <CashierLogin onLogin={handleLogin} onBackToHome={handleBackToHome} />;
        }
    }

    if (currentState === 'dashboard' && isAuthenticated) {
        if (userRole === 'cashier') {
            return <CashierDashboard onLogout={handleLogout} cashierName={cashierName} cashierId={cashierId} cashierRole={cashierRole} />;
        } else if (userRole === 'admin') {
            // Admin Dashboard with full access
            return <AdminDashboard onLogout={handleLogout} userRole={userRole} />;
        } else if (userRole === 'manager') {
            // Manager Dashboard with access to Order Queue, Order History, and Menu Management
            return <AdminDashboard onLogout={handleLogout} userRole={userRole} />;
        } else if (userRole === 'waiter') {
            // Waiter Dashboard with limited Order Queue access only
            return <AdminDashboard onLogout={handleLogout} userRole={userRole} />;
        }
    }

    // Fallback
    return <HomePage onSelectRole={handleRoleSelection} />;
};

// Main App component with OrderProvider wrapper
const App = () => {
    return (
        <OrderProvider>
            <AppContent />
        </OrderProvider>
    );
};

export default App;