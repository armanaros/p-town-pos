import React from 'react';

interface HomePageProps {
    onSelectRole: (role: 'admin' | 'cashier') => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSelectRole }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f0f8ff'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '3rem',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                textAlign: 'center',
                maxWidth: '500px',
                width: '100%'
            }}>
                <h1 style={{ 
                    color: '#333', 
                    marginBottom: '1rem',
                    fontSize: '2.5rem',
                    fontWeight: 'bold'
                }}>
                    🏪 P-Town POS
                </h1>
                
                <p style={{ 
                    color: '#666', 
                    marginBottom: '3rem',
                    fontSize: '1.1rem'
                }}>
                    Welcome to P-Town Point of Sale System
                </p>
                
                <div style={{ 
                    display: 'flex', 
                    gap: '2rem',
                    flexDirection: window.innerWidth < 600 ? 'column' : 'row'
                }}>
                    <button
                        onClick={() => onSelectRole('admin')}
                        style={{
                            flex: 1,
                            padding: '2rem 1rem',
                            backgroundColor: '#2196f3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s',
                            boxShadow: '0 2px 8px rgba(33,150,243,0.3)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2196f3'}
                    >
                        👨‍💼<br />
                        Admin Login
                        <div style={{ fontSize: '0.9rem', fontWeight: 'normal', marginTop: '0.5rem' }}>
                            View reports & manage system
                        </div>
                    </button>
                    
                    <button
                        onClick={() => onSelectRole('cashier')}
                        style={{
                            flex: 1,
                            padding: '2rem 1rem',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s',
                            boxShadow: '0 2px 8px rgba(76,175,80,0.3)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#388e3c'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4caf50'}
                    >
                        💰<br />
                        Cashier Login
                        <div style={{ fontSize: '0.9rem', fontWeight: 'normal', marginTop: '0.5rem' }}>
                            Process orders & sales
                        </div>
                    </button>
                </div>
            </div>
            
            {/* Footer */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#666',
                fontSize: '0.9rem',
                textAlign: 'center'
            }}>
                © 2025 P-Town Point of Sale System
            </div>
        </div>
    );
};

export default HomePage;
