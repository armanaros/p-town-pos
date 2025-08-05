import React, { useState } from 'react';
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

        // Check against stored cashier accounts
        const savedCashiers = localStorage.getItem('p-town-cashiers');
        let isValid = false;
        let cashierName = '';
        let cashierId = '';
        let cashierRole = '';

        if (savedCashiers) {
            const cashiers = JSON.parse(savedCashiers);
            const foundCashier = cashiers.find((cashier: any) => 
                cashier.username === username && cashier.password === password
            );
            if (foundCashier) {
                isValid = true;
                cashierName = foundCashier.name;
                cashierId = foundCashier.id;
                cashierRole = foundCashier.role || 'cashier';
            }
        }

        // Fallback to default credentials if no cashiers are stored
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
        
        setLoading(false);
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #e8f5e8 0%, #d1f2d1 50%, #b8e6b8 100%)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                padding: '3rem',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(76, 175, 80, 0.15), 0 8px 25px rgba(0, 0, 0, 0.08)',
                width: '100%',
                maxWidth: '500px',
                position: 'relative',
                border: '1px solid rgba(255, 255, 255, 0.3)'
            }} className="login-container">
                {/* Logo and header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <Logo 
                        size={200}
                        style={{ 
                            margin: '0 auto 1.5rem',
                            boxShadow: '0 15px 40px rgba(76, 175, 80, 0.2)',
                            borderRadius: '20px',
                            width: '240px',
                            height: '200px'
                        }}
                        className="logo"
                    />
                    <h2 style={{ 
                        margin: '0 0 0.5rem 0', 
                        fontSize: '1.6rem',
                        fontWeight: '700',
                        color: 'white',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                    }}>
                        P-Town POS
                    </h2>
                    <p style={{ 
                        margin: '0.5rem 0 0 0', 
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '1rem',
                        textShadow: '0 1px 5px rgba(0, 0, 0, 0.2)'
                    }}>
                        Cashier Portal
                    </p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            color: 'white',
                            fontWeight: '500',
                            fontSize: '0.95rem',
                            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                        }}>
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Enter your username"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                border: '2px solid #e8e8e8',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                transition: 'all 0.3s ease',
                                outline: 'none',
                                fontFamily: 'inherit',
                                background: '#fafafa'
                            }}
                            onFocus={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.style.borderColor = '#4caf50';
                                target.style.background = '#fff';
                                target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                            }}
                            onBlur={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.style.borderColor = '#e8e8e8';
                                target.style.background = '#fafafa';
                                target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            color: 'white',
                            fontWeight: '500',
                            fontSize: '0.95rem',
                            textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                border: '2px solid #e8e8e8',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                transition: 'all 0.3s ease',
                                outline: 'none',
                                fontFamily: 'inherit',
                                background: '#fafafa'
                            }}
                            onFocus={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.style.borderColor = '#4caf50';
                                target.style.background = '#fff';
                                target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
                            }}
                            onBlur={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.style.borderColor = '#e8e8e8';
                                target.style.background = '#fafafa';
                                target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    
                    {error && (
                        <div style={{
                            color: '#e53e3e',
                            marginBottom: '1.5rem',
                            textAlign: 'center',
                            fontSize: '0.9rem',
                            padding: '0.75rem',
                            backgroundColor: '#fed7d7',
                            borderRadius: '8px',
                            border: '1px solid #feb2b2'
                        }}>
                            {error}
                        </div>
                    )}
                    
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: loading ? '#a0a0a0' : 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: loading ? 'none' : '0 4px 15px rgba(76, 175, 80, 0.3)',
                            transform: loading ? 'none' : 'translateY(0)',
                            marginBottom: '1rem'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                const target = e.target as HTMLButtonElement;
                                target.style.transform = 'translateY(-2px)';
                                target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                const target = e.target as HTMLButtonElement;
                                target.style.transform = 'translateY(0)';
                                target.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
                            }
                        }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <span style={{ 
                                    width: '16px', 
                                    height: '16px', 
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
                        padding: '0.75rem',
                        backgroundColor: 'transparent',
                        color: '#666',
                        border: '2px solid #e8e8e8',
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                        const target = e.target as HTMLButtonElement;
                        target.style.borderColor = '#4caf50';
                        target.style.color = '#4caf50';
                        target.style.background = 'rgba(76, 175, 80, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                        const target = e.target as HTMLButtonElement;
                        target.style.borderColor = '#e8e8e8';
                        target.style.color = '#666';
                        target.style.background = 'transparent';
                    }}
                >
                    ← Back to Home
                </button>
                
                {/* Footer - moved inside container */}
                <div style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                    marginTop: '2rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    © 2025 P-Town Point of Sale System
                </div>
            </div>
        </div>
    );
};

export default CashierLogin;
