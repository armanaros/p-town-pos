import React from 'react';
import { MenuItem } from '../types';

type MenuProps = {
    items: MenuItem[];
    onAddToCart: (id: number) => void;
    onRemove: (id: number) => void;
};

const Menu: React.FC<MenuProps> = ({ items, onAddToCart, onRemove }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ textAlign: 'center' }}>Menu</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {items.map(item => (
                    <div key={item.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                        <h3>{item.name}</h3>
                        <p>₱{item.price.toFixed(2)}</p>
                        <button onClick={() => onAddToCart(item.id)} style={{ padding: '8px 16px', background: '#f0c040', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            Add to Cart
                        </button>
                        <button onClick={() => onRemove(item.id)} style={{ padding: '8px 16px', background: '#e57373', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '8px' }}>
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Menu;