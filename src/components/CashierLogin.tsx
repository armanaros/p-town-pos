import React, { useState } from 'react';
import { dataService } from '../utils/dataService';
import Logo from './Logo';

interface CashierLoginProps {
    onLogin: (isAuthenticated: boolean, cashierName?: string, cashierId?: string, cashierRole?: string) => void;
    onBackToHome: () => void;
}

const CashierLogin: React.FC<CashierLoginProps> = ({ onLogin, onBackToHome }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Add CSS for spinner animation
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate authentication delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Fetch cashiers from Firestore
        try {
                const cashiers = await dataService.getCashiers();
            let isValid = false;
            let cashierName = '';
            let cashierId = '';
            let cashierRole = '';

            const foundCashier = cashiers.find((cashier: any) => 
                cashier.username === username && cashier.password === password
            );
            if (foundCashier) {
                isValid = true;
                cashierName = foundCashier.name;
                cashierId = foundCashier.id;
                cashierRole = foundCashier.role || 'cashier';
            }

            // Fallback to default credentials
            if (!isValid && username === 'cashier' && password === 'cashier123') {
                isValid = true;
                cashierName = 'Default Cashier';
                cashierId = 'default-cashier';
                cashierRole = 'cashier';
            }

            if (isValid) {
                onLogin(true, cashierName, cashierId, cashierRole);
            } else {
                setError('Invalid username or password');
                onLogin(false);
            }
        } catch (err) {
            setError('Login failed. Please try again.');
            onLogin(false);
        }
        setLoading(false);
    };

    return (
        <div className="login-main" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #e8f5e8 0%, #d1f2d1 50%, #b8e6b8 100%)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
            <div className="login-container" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                padding: window.innerWidth <= 480 ? '1.5rem' : '2rem',
                maxWidth: window.innerWidth <= 480 ? '300px' : '340px',
                margin: '0 auto',
                width: '85%',
                borderRadius: '16px',
                boxShadow: '0 12px 32px rgba(76, 175, 80, 0.12)',
                position: 'relative',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginBottom: '100px' // more space for footer
            }}>
                <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                    <Logo 
                        size={120}
                        className="login-logo"
                        style={{ 
                            margin: '0 auto 1rem',
                            boxShadow: '0 8px 24px rgba(76, 175, 80, 0.12)',
                            borderRadius: '16px',
                            width: '120px',
                            height: '100px'
                        }}
                    />
                    <h2 style={{ 
                        margin: '0 0 0.3rem 0', 
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        color: '#222', // dark color for visibility
                        textShadow: '0 1px 2px rgba(255,255,255,0.2)'
                    }}>
                        P-Town POS
                    </h2>
                    <p style={{ 
                        margin: '0.3rem 0 0 0', 
                        color: '#333', // dark color for visibility
                        fontSize: '0.95rem',
                        textShadow: '0 1px 3px rgba(255,255,255,0.15)'
                    }}>
                        Employee Portal
                    </p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.3rem', 
                            color: '#222', // dark color for visibility
                            fontWeight: '500', 
                            fontSize: '0.9rem', 
                            textShadow: '0 1px 2px rgba(255,255,255,0.2)'
                        }}>
                            Username
                        </label>
                        <input className="login-form-input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Enter your username" style={{ width: '88%', padding: window.innerWidth <= 480 ? '0.5rem 0.8rem' : '0.6rem 1rem', border: '2px solid #e8e8e8', borderRadius: '10px', fontSize: window.innerWidth <= 480 ? '0.88rem' : '0.92rem', background: '#fafafa', margin: '0 auto', display: 'block' }} />
                    </div>
                    
                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.3rem', 
                            color: '#222', // dark color for visibility
                            fontWeight: '500', 
                            fontSize: '0.9rem', 
                            textShadow: '0 1px 2px rgba(255,255,255,0.2)'
                        }}>
                            Password
                        </label>
                        <input className="login-form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" style={{ width: '88%', padding: window.innerWidth <= 480 ? '0.5rem 0.8rem' : '0.6rem 1rem', border: '2px solid #e8e8e8', borderRadius: '10px', fontSize: window.innerWidth <= 480 ? '0.88rem' : '0.92rem', background: '#fafafa', margin: '0 auto', display: 'block' }} />
                    </div>
                    
                    {error && (
                        <div style={{
                            color: '#e53e3e',
                            marginBottom: '1rem',
                            textAlign: 'center',
                            fontSize: '0.85rem',
                            padding: '0.5rem',
                            backgroundColor: '#fed7d7',
                            borderRadius: '7px',
                            border: '1px solid #feb2b2'
                        }}>
                            {error}
                        </div>
                    )}
                    
                    <button
                        className="login-form-button"
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: window.innerWidth <= 480 ? '0.6rem' : '0.7rem',
                            background: loading ? '#a0a0a0' : 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: window.innerWidth <= 480 ? '0.95rem' : '1rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: loading ? 'none' : '0 2px 8px rgba(76, 175, 80, 0.12)'
                        }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <span style={{ 
                                    width: '14px', 
                                    height: '14px', 
                                    border: '2px solid transparent',
                                    borderTop: '2px solid white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></span>
                                Signing In...
                            </span>
                        ) : 'Access POS System'}
                    </button>
                </form>
                
                <button
                    onClick={onBackToHome}
                    style={{
                        width: '100%',
                        padding: window.innerWidth <= 480 ? '0.5rem' : '0.6rem',
                        backgroundColor: 'transparent',
                        color: '#222',
                        border: '2px solid #e8e8e8',
                        borderRadius: '10px',
                        fontSize: window.innerWidth <= 480 ? '0.85rem' : '0.9rem',
                        cursor: 'pointer',
                        fontWeight: '500',
                        marginTop: '0.7rem'
                    }}
                >
                    ← Back to Home
                </button>
            </div>
            
            <div style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#222',
                fontSize: '0.85rem',
                textAlign: 'center',
                textShadow: '0 1px 2px rgba(255,255,255,0.2)',
                background: 'transparent',
                padding: 0,
                borderRadius: 0,
                width: 'auto',
                zIndex: 100
            }}>
                © 2025 P-Town Point of Sale System
            </div>
        </div>
    );
};

export default CashierLogin;
