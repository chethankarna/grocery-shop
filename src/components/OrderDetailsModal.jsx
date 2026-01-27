import './OrderDetailsModal.css'

function OrderDetailsModal({ order, isOpen, onClose, onStatusChange, isUpdating }) {
    if (!isOpen || !order) return null

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A'
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
        return date.toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        })
    }

    const getStatusColor = (status) => {
        const colors = {
            'NEW': '#10B880',
            'PROCESSING': '#F59E0B',
            'COMPLETED': '#059669',
            'CANCELLED': '#EF4444'
        }
        return colors[status] || '#6B7280'
    }

    return (
        <div className="order-modal-overlay" onClick={onClose}>
            <div className="order-modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="order-modal-header">
                    <div>
                        <h2>Order Details</h2>
                        <p className="order-id">#{order.id}</p>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Content */}
                <div className="order-modal-content">
                    {/* Status Section */}
                    <div className="detail-section">
                        <h3>Order Status</h3>
                        <select
                            value={order.status}
                            onChange={(e) => onStatusChange(order.id, e.target.value)}
                            className="status-select-modal"
                            style={{ backgroundColor: getStatusColor(order.status) }}
                            disabled={isUpdating}
                        >
                            <option value="NEW">NEW</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                        <p className="order-date">Placed on: {formatDate(order.createdAt)}</p>
                    </div>

                    {/* Customer Information */}
                    <div className="detail-section">
                        <h3>Customer Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Name:</span>
                                <span className="info-value">{order.customer_name}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Phone:</span>
                                <span className="info-value">{order.customer_phone}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Email:</span>
                                <span className="info-value">{order.userEmail || 'N/A'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Order Type:</span>
                                <span className="info-value order-type-badge">{order.order_type}</span>
                            </div>
                        </div>

                        {order.order_type === 'DELIVERY' && order.delivery_address && (
                            <div className="address-box">
                                <span className="info-label">Delivery Address:</span>
                                <p className="address-text">{order.delivery_address}</p>
                            </div>
                        )}

                        {order.order_type === 'PICKUP' && order.pickup_datetime && (
                            <div className="info-item">
                                <span className="info-label">Pickup Time:</span>
                                <span className="info-value">{formatDate(order.pickup_datetime)}</span>
                            </div>
                        )}

                        {order.notes && (
                            <div className="address-box">
                                <span className="info-label">Customer Notes:</span>
                                <p className="address-text">{order.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="detail-section">
                        <h3>Order Items ({order.items?.length || 0})</h3>
                        <div className="items-table">
                            <div className="items-table-header">
                                <span>Product</span>
                                <span>Quantity</span>
                                <span>Price</span>
                                <span>Total</span>
                            </div>
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="items-table-row">
                                    <div className="item-product-info">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="item-image"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        )}
                                        <span className="item-name">{item.name}</span>
                                    </div>
                                    <span className="item-qty">×{item.qty}</span>
                                    <span className="item-price">₹{item.price?.toFixed(2)}</span>
                                    <span className="item-total">₹{item.lineTotal?.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="detail-section">
                        <h3>Order Summary</h3>
                        <div className="summary-box">
                            <div className="summary-row">
                                <span>Subtotal:</span>
                                <span>₹{order.subtotal?.toFixed(2)}</span>
                            </div>
                            {order.delivery_fee > 0 && (
                                <div className="summary-row">
                                    <span>Delivery Fee:</span>
                                    <span>₹{order.delivery_fee?.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="summary-row summary-total">
                                <span>Total:</span>
                                <span>₹{order.total?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="order-modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    )
}

export default OrderDetailsModal
