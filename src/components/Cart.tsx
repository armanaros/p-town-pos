import React from 'react';

type CartProps = {
    cartItems: Record<number, number>;
    menuItems: { id: number; name: string; price: number }[];
    onUpdateQuantity: (id: number, count: number) => void;
    onRemoveItem: (id: number) => void;
};

const Cart: React.FC<CartProps> = ({ cartItems, menuItems, onUpdateQuantity, onRemoveItem }) => {
    const getTotal = () => {
        return Object.entries(cartItems).reduce((total, [id, qty]) => {
            const item = menuItems.find(menuItem => menuItem.id === Number(id));
            return item ? total + item.price * qty : total;
        }, 0);
    };

    return (
        <div style={{ width: '100%', marginBottom: 32 }}>
            <h2 style={{ textAlign: 'center' }}>Cart</h2>
            <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>
                {Object.entries(cartItems).map(([id, qty]) => {
                    const item = menuItems.find(menuItem => menuItem.id === Number(id));
                    return item ? (
                        <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span>{item.name} (₱{item.price})</span>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <button onClick={() => onUpdateQuantity(item.id, qty - 1)} disabled={qty <= 1}>-</button>
                                <span style={{ margin: '0 8px' }}>{qty}</span>
                                <button onClick={() => onUpdateQuantity(item.id, qty + 1)}>+</button>
                                <button onClick={() => onRemoveItem(item.id)} style={{ marginLeft: 8 }}>Remove</button>
                            </div>
                        </div>
                    ) : null;
                })}
            </div>
            <div style={{ fontWeight: 'bold', fontSize: 16, textAlign: 'right' }}>
                Total: ₱{getTotal()}
            </div>
        </div>
    );
};

export default Cart;