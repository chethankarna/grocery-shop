import { formatCurrency } from '../../utils/currency';
import OrderStatusBadge from './OrderStatusBadge';
import './OrderDetailsModal.css';

function OrderDetailsModal({ order, onClose }) {
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const getOrderTypeIcon = (type) => type === 'DELIVERY' ? '🚚' : '📦';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content order-details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Order Details</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {/* Order Info */}
                    <div className="detail-section">
                        <div className="order-info-header">
                            <div>
                                <h3>{getOrderTypeIcon(order.order_type)} Order #{order.id.slice(-8).toUpperCase()}</h3>
                                <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
                            </div>
                            <OrderStatusBadge status={order.status} />
                        </div>
                    </div>

                    {/* Delivery/Pickup Info */}
                    <div className="detail-section">
                        <h4>{order.order_type === 'DELIVERY' ? '🚚 Delivery Information' : '📦 Pickup Information'}</h4>
                        <div className="detail-content">
                            {order.order_type === 'DELIVERY' ? (
                                <p className="detail-text">{order.delivery_address}</p>
                            ) : (
                                <p className="detail-text">
                                    Pickup at: {new Date(order.pickup_datetime).toLocaleString('en-IN')}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="detail-section">
                        <h4>🛒 Order Items ({order.items?.length || 0})</h4>
                        <div className="items-table">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="item-row">
                                    <div className="item-info">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="item-image-small"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        )}
                                        <div className="item-text">
                                            <span className="item-name">{item.name}</span>
                                            <span className="item-qty">×{item.qty}</span>
                                        </div>
                                    </div>
                                    <div className="item-pricing">
                                        <span className="item-price">{formatCurrency(item.price)}</span>
                                        <span className="item-total">{formatCurrency(item.lineTotal)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="detail-section">
                        <h4>💰 Order Summary</h4>
                        <div className="summary-grid">
                            <div className="summary-row">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            {order.delivery_fee > 0 && (
                                <div className="summary-row">
                                    <span>Delivery Fee:</span>
                                    <span>{formatCurrency(order.delivery_fee)}</span>
                                </div>
                            )}
                            <div className="summary-row total">
                                <span>Total Amount:</span>
                                <span>{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    {order.notes && (
                        <div className="detail-section">
                            <h4>📝 Notes</h4>
                            <p className="detail-text notes">{order.notes}</p>
                        </div>
                    )}

                    {/* Updated At */}
                    {order.updatedAt && (
                        <div className="detail-section">
                            <p className="last-updated">
                                Last updated: {formatDate(order.updatedAt)}
                            </p>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn-close">Close</button>
                </div>
            </div>
        </div>
    );
}

export default OrderDetailsModal;
