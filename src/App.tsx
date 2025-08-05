import React, { useState, useEffect } from 'react';
import { SalesData } from './types';
import { useOrderContext, OrderProvider } from './context/OrderContext';
import HomePage from './components/HomePage';
import AdminLogin from './components/AdminLogin';
import CashierLogin from './components/CashierLogin';
import CashierDashboard from './components/CashierDashboard';
import AdminDashboard from './components/AdminDashboard_clean';
import './styles/main.css';

type UserRole = 'admin' | 'cashier' | null;
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

    const handleRoleSelection = (role: 'admin' | 'cashier') => {
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
    };

    const handleBackToHome = () => {
        setCurrentState('home');
        setUserRole(null);
        setIsAuthenticated(false);
    };

    useEffect(() => {
        // No need to fetch mock data anymore - using real data from context
        setLoading(false);
    }, [isAuthenticated, userRole]);

    // Render based on current state
    if (currentState === 'home') {
        return <HomePage onSelectRole={handleRoleSelection} />;
    }

    if (currentState === 'login') {
        if (userRole === 'admin') {
            return <AdminLogin onLogin={handleLogin} onBackToHome={handleBackToHome} />;
        } else if (userRole === 'cashier') {
            return <CashierLogin onLogin={handleLogin} onBackToHome={handleBackToHome} />;
        }
    }

    if (currentState === 'dashboard' && isAuthenticated) {
        if (userRole === 'cashier') {
            return <CashierDashboard onLogout={handleLogout} cashierName={cashierName} cashierId={cashierId} cashierRole={cashierRole} />;
        } else if (userRole === 'admin') {
            // Admin Dashboard
            return <AdminDashboard onLogout={handleLogout} />;
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