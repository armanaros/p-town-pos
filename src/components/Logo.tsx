import React from 'react';

// Import the logo image
let logoImage: string;
try {
    logoImage = require('../img/ptown-logo.png');
} catch {
    logoImage = '';
}

interface LogoProps {
    size?: number;
    className?: string;
    style?: React.CSSProperties;
}

const Logo: React.FC<LogoProps> = ({ size = 200, className, style }) => {
    // Check if logo image is available
    const [imageError, setImageError] = React.useState(!logoImage);
    
    const logoStyle: React.CSSProperties = {
        width: style?.width || `${size}px`,
        height: style?.height || `${size}px`,
        borderRadius: '20px',
        display: 'block',
        objectFit: 'contain',
        background: 'transparent',
        ...style
    };

    if (imageError || !logoImage) {
        // Fallback gradient logo
        return (
            <div 
                className={className}
                style={{
                    ...logoStyle,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: `${size * 0.3}rem`,
                    color: 'white',
                    fontWeight: 'bold',
                    boxShadow: '0 12px 30px rgba(102, 126, 234, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '16px'
                }}
            >
                🏪
            </div>
        );
    }

    return (
        <img
            src={logoImage}
            alt="P-Town Logo"
            className={className}
            style={logoStyle}
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
        />
    );
};

export default Logo;
