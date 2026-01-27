import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    listenOrderRealtime,
    updateOrderStatus,
    updateOrderNotes,
    getNextStatuses
} from '../../services/ordersService';
import OrderStatusControls from '../../components/admin/OrderStatusControls';
import './AdminOrders.css';

function AdminOrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin, loading: authLoading } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notes, setNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);

    // Redirect non-admin users
    useEffect(() => {
        if (!authLoading && (!user || !isAdmin)) {
            navigate('/');
        }
    }, [user, isAdmin, authLoading, navigate]);

    // Realtime listener for this order
    useEffect(() => {
        if (!id || !user || !isAdmin) return;

        setLoading(true);
        const unsubscribe = listenOrderRealtime(id, (fetchedOrder) => {
            if (fetchedOrder) {
                setOrder(fetchedOrder);
                setNotes(fetchedOrder.notes || '');
                setError(null);
            } else {
                setError('Order not found');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id, user, isAdmin]);

    // Helper functions
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const formatCurrency = (amount) => `₹${amount?.toFixed(2) || 0}`;

    const handleSaveNotes = async () => {
        if (!order) return;

        setSavingNotes(true);
        try {
            await updateOrderNotes(order.id, notes);
            // Success feedback handled by realtime listener
        } catch (err) {
            alert('Failed to save notes: ' + err.message);
        } finally {
            setSavingNotes(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!order) return;

        try {
            await updateOrderStatus(order.id, newStatus);
            // Success - realtime listener will update UI
        } catch (err) {
            alert('Failed to update status: ' + err.message);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="order-details-page">
                <div className="admin-container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading order details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="order-details-page">
                <div className="admin-container">
                    <button onClick={() => navigate('/admin/orders')} className="back-button">
                        ← Back to Orders
                    </button>
                    <div className="error-state">
                        <p>{error || 'Order not found'}</p>
                        <button onClick={() => navigate('/admin/orders')}>Back to Orders</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="order-details-page">
            <div className="admin-container">
                <button onClick={() => navigate('/admin/orders')} className="back-button">
                    ← Back to Orders
                </button>

                {/* Header */}
                <div className="details-header">
                    <h1 className="details-title">
                        Order #{order.id.slice(-8)}
                    </h1>
                    <p className="details-meta">
                        Placed {formatDate(order.createdAt)}
                        {order.updatedAt && ` • Last updated ${formatDate(order.updatedAt)}`}
                    </p>
                </div>

                {/* Customer Information */}
                <div className="detail-section">
                    <h2 className="section-title">👤 Customer Information</h2>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <span className="detail-label">Name</span>
                            <span className="detail-value">{order.customer_name}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Phone</span>
                            <span className="detail-value">{order.customer_phone}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Email</span>
                            <span className="detail-value">{order.userEmail || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Delivery/Pickup Information */}
                <div className="detail-section">
                    <h2 className="section-title">
                        {order.order_type === 'DELIVERY' ? '🚚 Delivery Information' : '📦 Pickup Information'}
                    </h2>
                    {order.order_type === 'DELIVERY' ? (
                        <div className="detail-item">
                            <span className="detail-label">Delivery Address</span>
                            <span className="detail-value">{order.delivery_address}</span>
                        </div>
                    ) : (
                        <div className="detail-item">
                            <span className="detail-label">Pickup Time</span>
                            <span className="detail-value">
                                {new Date(order.pickup_datetime).toLocaleString('en-IN')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Order Items */}
                <div className="detail-section">
                    <h2 className="section-title">🛒 Order Items</h2>
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items?.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.name}</td>
                                    <td>{item.qty}</td>
                                    <td>{formatCurrency(item.price)}</td>
                                    <td>{formatCurrency(item.lineTotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="order-totals">
                        <div className="total-row">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        {order.delivery_fee > 0 && (
                            <div className="total-row">
                                <span>Delivery Fee:</span>
                                <span>{formatCurrency(order.delivery_fee)}</span>
                            </div>
                        )}
                        <div className="total-row final">
                            <span>Total:</span>
                            <span>{formatCurrency(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Admin Notes */}
                <div className="detail-section">
                    <h2 className="section-title">📝 Admin Notes</h2>
                    <textarea
                        className="notes-textarea"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add internal notes about this order..."
                        disabled={savingNotes}
                    />
                    {notes !== (order.notes || '') && (
                        <button
                            onClick={handleSaveNotes}
                            disabled={savingNotes}
                            className="btn-status primary"
                            style={{ marginTop: '0.75rem' }}
                        >
                            {savingNotes ? 'Saving...' : 'Save Notes'}
                        </button>
                    )}
                </div>

                {/* Status Controls */}
                <div className="detail-section">
                    <h2 className="section-title">🔄 Order Status</h2>
                    <OrderStatusControls
                        currentStatus={order.status}
                        onStatusUpdate={handleStatusUpdate}
                    />
                </div>
            </div>
        </div>
    );
}

export default AdminOrderDetails;
