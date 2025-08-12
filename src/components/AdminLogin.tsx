import React, { useState } from 'react';
import Logo from './Logo';

interface AdminLoginProps {
    onLogin: (isAuthenticated: boolean) => void;
    onBackToHome: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBackToHome }) => {
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

        // Simple authentication check (replace with real authentication)
        if (username === 'admin' && password === 'admin123') {
            onLogin(true);
        } else {
            setError('Invalid username or password');
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
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
        }}>
            <div className="login-container" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                padding: '2rem',
                maxWidth: '340px',
                margin: '0 auto',
                width: '85%',
                borderRadius: '16px',
                boxShadow: '0 12px 32px rgba(30, 60, 114, 0.12)',
                position: 'relative',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginBottom: '100px' // more space for footer
            }}>
                {/* Decorative Elements */}
                <div style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    borderRadius: '50%',
                    opacity: 0.08
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '-20px',
                    left: '-20px',
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(45deg, #764ba2, #667eea)',
                    borderRadius: '50%',
                    opacity: 0.08
                }}></div>

                {/* Logo Section */}
                <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                    <Logo 
                        size={120}
                        className="login-logo"
                        style={{ 
                            margin: '0 auto 1rem',
                            boxShadow: '0 8px 24px rgba(30, 60, 114, 0.2)',
                            borderRadius: '16px',
                            width: '120px',
                            height: '100px'
                        }}
                    />
                    <h2 style={{ 
                        margin: 0, 
                        color: 'white',
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        textShadow: '0 1px 6px rgba(0, 0, 0, 0.2)'
                    }}>
                        P-Town POS
                    </h2>
                    <p style={{ 
                        margin: '0.3rem 0 0 0', 
                        color: 'rgba(255, 255, 255, 0.85)',
                        fontSize: '0.95rem',
                        textShadow: '0 1px 3px rgba(0, 0, 0, 0.15)'
                    }}>
                        Admin Dashboard
                    </p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.3rem', 
                            color: 'white',
                            fontWeight: '500',
                            fontSize: '0.9rem',
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                        }}>
                            Username
                        </label>
                        <input
                            className="login-form-input"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Enter your username"
                            style={{
                                width: '92%',
                                padding: '0.7rem 1.2rem',
                                border: '2px solid #e8e8e8',
                                borderRadius: '10px',
                                fontSize: '0.95rem',
                                background: '#fafafa',
                                margin: '0 auto',
                                display: 'block'
                            }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.3rem', 
                            color: 'white',
                            fontWeight: '500',
                            fontSize: '0.9rem',
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                        }}>
                            Password
                        </label>
                        <input
                            className="login-form-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                            style={{
                                width: '92%',
                                padding: '0.7rem 1.2rem',
                                border: '2px solid #e8e8e8',
                                borderRadius: '10px',
                                fontSize: '0.95rem',
                                background: '#fafafa',
                                margin: '0 auto',
                                display: 'block'
                            }}
                        />
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
                            padding: '0.7rem',
                            background: loading ? '#a0a0a0' : 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: loading ? 'none' : '0 2px 8px rgba(30, 60, 114, 0.2)',
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
                                Logging in...
                            </span>
                        ) : 'Sign In'}
                    </button>
                </form>
                
                <button
                    className="login-back-button"
                    onClick={onBackToHome}
                    style={{
                        width: '100%',
                        padding: '0.6rem',
                        backgroundColor: 'transparent',
                        color: 'white',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        fontWeight: '500',
                        marginTop: '0.7rem'
                    }}
                >
                    ← Back to Home
                </button>
            </div>
            
            <div className="login-footer" style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.85rem',
                textAlign: 'center',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
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

export default AdminLogin;
