import React, { useState } from 'react';
import { useOrderContext } from '../context/OrderContext';

interface ProcessedOrder {
    id: number;
    items: Record<number, number>;
    status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
    orderType: 'dine-in' | 'take-out';
    createdAt: string;
    updatedAt?: string;
    total: number;
    cashierName: string;
    customerName?: string;
    tableNumber?: number;
    estimatedTime?: number;
    cancellationReason?: string;
    cancelledBy?: string;
    cancelledAt?: string;
}

interface OrderQueueProps {
    currentUser?: { id: string; username: string };
}

const OrderQueue: React.FC<OrderQueueProps> = ({ currentUser }) => {
    const { 
        getQueueOrders, 
        updateOrderStatus, 
        cancelOrder,
        menuItems, 
        getPendingOrdersCount,
        getCompletedOrdersCount
    } = useOrderContext();
    
    const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'served'>('all');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<ProcessedOrder | null>(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    
    // Get orders for the queue - exclude cancelled orders from main queue display
    const { processedOrders } = useOrderContext();
    const queueOrders = processedOrders.filter(order => 
        order.status === 'pending' || 
        order.status === 'preparing' || 
        order.status === 'ready' ||
        order.status === 'served'
        // Cancelled orders are excluded from queue display
    );
    const pendingCount = getPendingOrdersCount();
    const completedCount = getCompletedOrdersCount();
    
    const filteredOrders = activeFilter === 'all' 
        ? queueOrders 
        : queueOrders.filter(order => order.status === activeFilter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#ffc107'; // Yellow
            case 'preparing': return '#17a2b8'; // Blue
            case 'ready': return '#28a745'; // Green
            case 'served': return '#6c757d'; // Gray
            case 'cancelled': return '#dc3545'; // Red
            default: return '#6c757d';
        }
    };

    const predefinedReasons = [
        'Customer requested cancellation',
        'Kitchen error - unable to prepare',
        'Item out of stock',
        'Payment issues',
        'Long wait time',
        'Wrong order details',
        'Customer no-show',
        'Other'
    ];

    const handleCancelOrder = (order: ProcessedOrder) => {
        setOrderToCancel(order);
        setShowCancelModal(true);
    };

    const confirmCancelOrder = () => {
        if (orderToCancel) {
            const finalReason = cancellationReason === 'Other' ? customReason : cancellationReason;
            if (!finalReason.trim()) {
                alert('Please select or enter a cancellation reason');
                return;
            }
            const cancelledBy = currentUser?.username || 'Queue Manager';
            cancelOrder(orderToCancel.id, finalReason, cancelledBy);
            setShowCancelModal(false);
            setOrderToCancel(null);
            setCancellationReason('');
            setCustomReason('');
        }
    };

    const closeCancelModal = () => {
        setShowCancelModal(false);
        setOrderToCancel(null);
        setCancellationReason('');
        setCustomReason('');
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'preparing': return 'Preparing';
            case 'ready': return 'Ready';
            case 'served': return 'Served';
            default: return status;
        }
    };

    const getNextStatus = (currentStatus: string) => {
        switch (currentStatus) {
            case 'pending': return 'preparing';
            case 'preparing': return 'ready';
            case 'ready': return 'served';
            case 'served': return 'completed';
            default: return 'completed';
        }
    };

    const getActionButtonText = (status: string) => {
        switch (status) {
            case 'pending': return 'Start Preparing';
            case 'preparing': return 'Mark Ready';
            case 'ready': return 'Mark Served';
            case 'served': return 'Complete';
            default: return 'Complete';
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });
    };

    const getElapsedTime = (createdAt: string) => {
        const now = new Date();
        const orderTime = new Date(createdAt);
        const diff = Math.floor((now.getTime() - orderTime.getTime()) / 60000); // in minutes
        
        if (diff < 60) {
            return `${diff}m`;
        } else {
            const hours = Math.floor(diff / 60);
            const minutes = diff % 60;
            return `${hours}h ${minutes}m`;
        }
    };

    const getOrderItems = (items: Record<number, number>) => {
        return Object.entries(items).map(([itemId, quantity]) => {
            const menuItem = menuItems.find(item => item.id === parseInt(itemId));
            return menuItem ? `${quantity}x ${menuItem.name}` : `${quantity}x Unknown`;
        }).join(', ');
    };

    return (
        <div style={{ padding: '1rem', height: '100%', overflow: 'auto' }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1rem',
                paddingBottom: '1rem',
                borderBottom: '2px solid #dee2e6'
            }}>
                <h2 style={{ margin: 0, color: '#333' }}>
                    🍽️ Order Queue
                    {pendingCount > 0 && (
                        <span style={{
                            marginLeft: '0.5rem',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                        }}>
                            {pendingCount} urgent
                        </span>
                    )}
                    {completedCount > 0 && (
                        <span style={{
                            marginLeft: '0.5rem',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#28a745',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                        }}>
                            {completedCount} served orders
                        </span>
                    )}
                </h2>
                
                {/* Filter Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['all', 'pending', 'preparing', 'ready', 'served'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter as any)}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: activeFilter === filter ? '#007bff' : '#e9ecef',
                                color: activeFilter === filter ? 'white' : '#495057',
                                border: '1px solid #dee2e6',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: activeFilter === filter ? 'bold' : 'normal',
                                textTransform: 'capitalize'
                            }}
                        >
                            {filter === 'all' ? 'All Orders' : filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Grid */}
            {filteredOrders.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    color: '#666'
                }}>
                    <h3>🎉 No {activeFilter === 'all' ? '' : activeFilter} orders in queue</h3>
                    <p>All caught up! Great work!</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '1rem'
                }}>
                    {filteredOrders
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                        .map(order => (
                        <div
                            key={order.id}
                            style={{
                                border: `3px solid ${getStatusColor(order.status)}`,
                                borderRadius: '12px',
                                padding: '1rem',
                                backgroundColor: 'white',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                position: 'relative'
                            }}
                        >
                            {/* Status Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '-12px',
                                left: '1rem',
                                backgroundColor: getStatusColor(order.status),
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                            }}>
                                {getStatusText(order.status)}
                            </div>

                            {/* Order Header */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start',
                                marginBottom: '1rem',
                                marginTop: '0.5rem'
                            }}>
                                <div>
                                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem' }}>
                                        Order #{order.id}
                                    </h3>
                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                        {formatTime(order.createdAt)} • {getElapsedTime(order.createdAt)} ago
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        padding: '0.25rem 0.5rem',
                                        backgroundColor: order.orderType === 'dine-in' ? '#e7f3ff' : '#fff3cd',
                                        color: order.orderType === 'dine-in' ? '#0c5460' : '#856404',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        marginBottom: '0.25rem'
                                    }}>
                                        {order.orderType === 'dine-in' ? '🍽️ Dine-In' : '🥡 Take-Out'}
                                    </div>
                                    {order.tableNumber && (
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                            Table {order.tableNumber}
                                        </div>
                                    )}
                                    {order.customerName && (
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                            {order.customerName}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div style={{ 
                                backgroundColor: '#f8f9fa', 
                                padding: '0.75rem', 
                                borderRadius: '6px',
                                marginBottom: '1rem'
                            }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    Items:
                                </div>
                                <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                                    {getOrderItems(order.items)}
                                </div>
                            </div>

                            {/* Total */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '1rem'
                            }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#28a745' }}>
                                    Total: ₱{order.total.toFixed(2)}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    by {order.cashierName}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {order.status !== 'served' && order.status !== 'cancelled' && order.status !== 'completed' ? (
                                    <>
                                        <button
                                            onClick={() => updateOrderStatus(order.id, getNextStatus(order.status) as any)}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                backgroundColor: getStatusColor(order.status),
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '1rem',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.opacity = '0.8';
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.opacity = '1';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            ✅ {getActionButtonText(order.status)}
                                        </button>
                                        <button
                                            onClick={() => handleCancelOrder(order)}
                                            style={{
                                                padding: '0.75rem',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '1rem',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.opacity = '0.8';
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.opacity = '1';
                                                e.currentTarget.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            ❌ Cancel
                                        </button>
                                    </>
                                ) : order.status === 'served' ? (
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Mark order #${order.id} as completed?`)) {
                                                updateOrderStatus(order.id, 'completed');
                                            }
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = '#218838';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = '#28a745';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        ✅ Complete Order
                                    </button>
                                ) : order.status === 'cancelled' ? (
                                    <div style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        borderRadius: '6px',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        textAlign: 'center'
                                    }}>
                                        ❌ Cancelled: {order.cancellationReason}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Cancel Order Modal */}
            {showCancelModal && orderToCancel && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#dc3545' }}>
                            ❌ Cancel Order #{orderToCancel.id}
                        </h3>
                        
                        <div style={{ marginBottom: '1rem' }}>
                            <strong>Customer:</strong> {orderToCancel.customerName || 'N/A'}<br />
                            <strong>Type:</strong> {orderToCancel.orderType}<br />
                            <strong>Total:</strong> ₱{orderToCancel.total.toFixed(2)}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Select cancellation reason:
                            </label>
                            <select
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid #dee2e6',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    marginBottom: '1rem'
                                }}
                            >
                                <option value="">-- Select a reason --</option>
                                {predefinedReasons.map(reason => (
                                    <option key={reason} value={reason}>{reason}</option>
                                ))}
                            </select>

                            {cancellationReason === 'Other' && (
                                <textarea
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    placeholder="Please specify the reason..."
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #dee2e6',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        minHeight: '80px',
                                        resize: 'vertical',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={closeCancelModal}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmCancelOrder}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                Confirm Cancellation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderQueue;
