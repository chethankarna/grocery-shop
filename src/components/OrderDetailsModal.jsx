// import './OrderDetailsModal.css'

// function OrderDetailsModal({ order, isOpen, onClose, onStatusChange, isUpdating }) {
//     if (!isOpen || !order) return null

//     const formatDate = (timestamp) => {
//         if (!timestamp) return 'N/A'
//         const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
//         return date.toLocaleString('en-IN', {
//             dateStyle: 'medium',
//             timeStyle: 'short'
//         })
//     }

//     const getStatusColor = (status) => {
//         const colors = {
//             'NEW': '#10B880',
//             'PROCESSING': '#F59E0B',
//             'COMPLETED': '#059669',
//             'CANCELLED': '#EF4444'
//         }
//         return colors[status] || '#6B7280'
//     }

//     return (
//         <div className="order-modal-overlay" onClick={onClose}>
//             <div className="order-modal-container" onClick={(e) => e.stopPropagation()}>
//                 {/* Header */}
//                 <div className="order-modal-header">
//                     <div>
//                         <h2>Order Details</h2>
//                         <p className="order-id">#{order.id}</p>
//                     </div>
//                     <button className="modal-close-btn" onClick={onClose}>✕</button>
//                 </div>

//                 {/* Content */}
//                 <div className="order-modal-content">
//                     {/* Status Section */}
//                     <div className="detail-section">
//                         <h3>Order Status</h3>
//                         <select
//                             value={order.status}
//                             onChange={(e) => onStatusChange(order.id, e.target.value)}
//                             className="status-select-modal"
//                             style={{ backgroundColor: getStatusColor(order.status) }}
//                             disabled={isUpdating}
//                         >
//                             <option value="NEW">NEW</option>
//                             <option value="PROCESSING">PROCESSING</option>
//                             <option value="COMPLETED">COMPLETED</option>
//                             <option value="CANCELLED">CANCELLED</option>
//                         </select>
//                         <p className="order-date">Placed on: {formatDate(order.createdAt)}</p>
//                     </div>

//                     {/* Customer Information */}
//                     <div className="detail-section">
//                         <h3>Customer Information</h3>
//                         <div className="info-grid">
//                             <div className="info-item">
//                                 <span className="info-label">Name:</span>
//                                 <span className="info-value">{order.customer_name}</span>
//                             </div>
//                             <div className="info-item">
//                                 <span className="info-label">Phone:</span>
//                                 <span className="info-value">{order.customer_phone}</span>
//                             </div>
//                             <div className="info-item">
//                                 <span className="info-label">Email:</span>
//                                 <span className="info-value">{order.userEmail || 'N/A'}</span>
//                             </div>
//                             <div className="info-item">
//                                 <span className="info-label">Order Type:</span>
//                                 <span className="info-value order-type-badge">{order.order_type}</span>
//                             </div>
//                         </div>

//                         {order.order_type === 'DELIVERY' && order.delivery_address && (
//                             <div className="address-box">
//                                 <span className="info-label">Delivery Address:</span>
//                                 <p className="address-text">{order.delivery_address}</p>
//                             </div>
//                         )}

//                         {order.order_type === 'PICKUP' && order.pickup_datetime && (
//                             <div className="info-item">
//                                 <span className="info-label">Pickup Time:</span>
//                                 <span className="info-value">{formatDate(order.pickup_datetime)}</span>
//                             </div>
//                         )}

//                         {order.notes && (
//                             <div className="address-box">
//                                 <span className="info-label">Customer Notes:</span>
//                                 <p className="address-text">{order.notes}</p>
//                             </div>
//                         )}
//                     </div>

//                     {/* Order Items */}
//                     <div className="detail-section">
//                         <h3>Order Items ({order.items?.length || 0})</h3>
//                         <div className="items-table">
//                             <div className="items-table-header">
//                                 <span>Product</span>
//                                 <span>Quantity</span>
//                                 <span>Price</span>
//                                 <span>Total</span>
//                             </div>
//                             {order.items?.map((item, idx) => (
//                                 <div key={idx} className="items-table-row">
//                                     <div className="item-product-info">
//                                         {item.image && (
//                                             <img
//                                                 src={item.image}
//                                                 alt={item.name}
//                                                 className="item-image"
//                                                 onError={(e) => e.target.style.display = 'none'}
//                                             />
//                                         )}
//                                         <span className="item-name">{item.name}</span>
//                                     </div>
//                                     <span className="item-qty">×{item.qty}</span>
//                                     <span className="item-price">₹{item.price?.toFixed(2)}</span>
//                                     <span className="item-total">₹{item.lineTotal?.toFixed(2)}</span>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Order Summary */}
//                     <div className="detail-section">
//                         <h3>Order Summary</h3>
//                         <div className="summary-box">
//                             <div className="summary-row">
//                                 <span>Subtotal:</span>
//                                 <span>₹{order.subtotal?.toFixed(2)}</span>
//                             </div>
//                             {order.delivery_fee > 0 && (
//                                 <div className="summary-row">
//                                     <span>Delivery Fee:</span>
//                                     <span>₹{order.delivery_fee?.toFixed(2)}</span>
//                                 </div>
//                             )}
//                             <div className="summary-row summary-total">
//                                 <span>Total:</span>
//                                 <span>₹{order.total?.toFixed(2)}</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Footer */}
//                 <div className="order-modal-footer">
//                     <button className="btn-secondary" onClick={onClose}>Close</button>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default OrderDetailsModal


// OrderDetailsModal.jsx
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../utils/currency';
import OrderStatusBadge from './orders/OrderStatusBadge';
import './OrderDetailsModal.css';

function OrderDetailsModal({ order = {}, onClose }) {
    // Early return if no order
    if (!order || Object.keys(order).length === 0) {
        return null;
    }

    // Defensive helpers
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        try {
            const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
        } catch {
            return 'N/A';
        }
    };

    const getOrderTypeIcon = (type) => (type === 'DELIVERY' ? '🚚' : '📦');

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    const items = Array.isArray(order.items) ? order.items : [];
    const subtotal = order?.subtotal ?? items.reduce((s, it) => s + (it?.lineTotal ?? (it?.price ?? 0) * (it?.qty ?? 1)), 0);

    // fallback safe id
    const shortId = order?.id ? String(order.id).slice(-8).toUpperCase() : 'N/A';

    return (
        <div
            className="modal-overlay"
            onClick={() => onClose?.()}
            role="presentation"
            data-testid="order-details-overlay"
        >
            <div
                className="modal-content order-details-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="order-details-title"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="modal-header">
                    <div>
                        <h2 id="order-details-title" className="modal-title">
                            {getOrderTypeIcon(order.order_type)} Order #{shortId}
                        </h2>
                        <p className="order-date">Placed on {formatDate(order?.createdAt)}</p>
                    </div>

                    <div className="header-right">
                        <OrderStatusBadge status={order?.status} />
                        <button
                            className="modal-close"
                            onClick={() => onClose?.()}
                            aria-label="Close order details"
                            title="Close"
                        >
                            ✕
                        </button>
                    </div>
                </header>

                <div className="modal-body">
                    {/* Delivery / Pickup */}
                    <section className="detail-section">
                        <h4 className="section-title">
                            {order?.order_type === 'DELIVERY' ? 'Delivery Information' : 'Pickup Information'}
                        </h4>
                        <div className="detail-content">
                            {order?.order_type === 'DELIVERY' ? (
                                <p className="detail-text">{order?.delivery_address ?? 'No address provided'}</p>
                            ) : (
                                <p className="detail-text">Pickup at: {formatDate(order?.pickup_datetime)}</p>
                            )}
                        </div>
                    </section>

                    {/* Items */}
                    <section className="detail-section">
                        <h4 className="section-title">🛒 Order Items ({items.length})</h4>
                        <div className="items-list">
                            {items.length === 0 && <div className="empty-text">No items in this order.</div>}
                            {items.map((item, i) => (
                                <div className="item-row" key={item?.id ?? i}>
                                    <div className="item-left">
                                        <img
                                            src={item?.image || '/images/product-placeholder.png'}
                                            alt={item?.name ?? 'product'}
                                            className="item-image"
                                            loading="lazy"
                                        />
                                    </div>

                                    <div className="item-center">
                                        <div className="item-title-row">
                                            <span className="item-name">{item?.name ?? 'Unnamed product'}</span>
                                            <span className="item-qty">×{item?.qty ?? 1}</span>
                                        </div>
                                        {item?.variant && <div className="item-variant">{item.variant}</div>}
                                    </div>

                                    <div className="item-right">
                                        <span className="item-price">{formatCurrency(item?.price ?? 0)}</span>
                                        <span className="item-total">{formatCurrency(item?.lineTotal ?? (item?.price ?? 0) * (item?.qty ?? 1))}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Summary */}
                    <section className="detail-section">
                        <h4 className="section-title">💰 Order Summary</h4>
                        <div className="summary-grid">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            {order?.delivery_fee > 0 && (
                                <div className="summary-row">
                                    <span>Delivery Fee</span>
                                    <span>{formatCurrency(order.delivery_fee)}</span>
                                </div>
                            )}
                            <div className="summary-row total-row">
                                <strong>Total</strong>
                                <strong>{formatCurrency(order?.total ?? subtotal + (order?.delivery_fee ?? 0))}</strong>
                            </div>
                        </div>

                        {order?.notes && (
                            <div className="detail-note">
                                <h5>Notes</h5>
                                <p>{order.notes}</p>
                            </div>
                        )}
                    </section>
                </div>

                <footer className="modal-footer">
                    <button onClick={() => onClose?.()} className="btn-close">Close</button>
                </footer>
            </div>
        </div>
    );
}

OrderDetailsModal.propTypes = {
    order: PropTypes.object,
    onClose: PropTypes.func.isRequired,
};

export default OrderDetailsModal;
