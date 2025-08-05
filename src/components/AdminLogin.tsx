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
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
        }}>
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                padding: '3rem',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                width: '100%',
                maxWidth: '500px',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.3)'
            }} className="login-container">
                {/* Decorative Elements */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '100px',
                    height: '100px',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    borderRadius: '50%',
                    opacity: 0.1
                }}></div>
                <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '-30px',
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(45deg, #764ba2, #667eea)',
                    borderRadius: '50%',
                    opacity: 0.1
                }}></div>

                {/* Logo Section */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Logo 
                        size={200}
                        style={{ 
                            margin: '0 auto 1.5rem',
                            boxShadow: '0 15px 40px rgba(30, 60, 114, 0.3)',
                            borderRadius: '20px',
                            width: '240px',
                            height: '200px'
                        }}
                        className="logo"
                    />
                    <h2 style={{ 
                        margin: 0, 
                        color: 'white',
                        fontSize: '1.6rem',
                        fontWeight: '600',
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
                        Admin Dashboard
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
                                target.style.borderColor = '#2a5298';
                                target.style.background = '#fff';
                                target.style.boxShadow = '0 0 0 3px rgba(42, 82, 152, 0.15)';
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
                                target.style.borderColor = '#2a5298';
                                target.style.background = '#fff';
                                target.style.boxShadow = '0 0 0 3px rgba(42, 82, 152, 0.15)';
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
                            background: loading ? '#a0a0a0' : 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: loading ? 'none' : '0 4px 15px rgba(30, 60, 114, 0.4)',
                            transform: loading ? 'none' : 'translateY(0)',
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                const target = e.target as HTMLButtonElement;
                                target.style.transform = 'translateY(-2px)';
                                target.style.boxShadow = '0 6px 20px rgba(30, 60, 114, 0.5)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                const target = e.target as HTMLButtonElement;
                                target.style.transform = 'translateY(0)';
                                target.style.boxShadow = '0 4px 15px rgba(30, 60, 114, 0.4)';
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
                                Logging in...
                            </span>
                        ) : 'Sign In'}
                    </button>
                </form>
                
                <button
                    onClick={onBackToHome}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'transparent',
                        color: 'white',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontWeight: '500',
                        marginTop: '1rem'
                    }}
                    onMouseEnter={(e) => {
                        const target = e.target as HTMLButtonElement;
                        target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                        target.style.background = 'rgba(255, 255, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        const target = e.target as HTMLButtonElement;
                        target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
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

export default AdminLogin;
