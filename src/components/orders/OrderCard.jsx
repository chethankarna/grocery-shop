import { formatCurrency } from '../../utils/currency';
import OrderStatusBadge from './OrderStatusBadge';
import './OrderCard.css';

function OrderCard({ order, onClick }) {
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getOrderTypeIcon = (type) => type === 'DELIVERY' ? '🚚' : '📦';

    const isNew = order.createdAt &&
        (new Date() - (order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt))) < 86400000; // 24 hours

    return (
        <div
            className={`order-card ${isNew ? 'new-order' : ''}`}
            onClick={() => onClick(order)}
        >
            {isNew && <div className="new-badge">NEW</div>}

            <div className="order-card-header">
                <div className="order-id">
                    {getOrderTypeIcon(order.order_type)} Order #{order.id.slice(-6).toUpperCase()}
                </div>
                <OrderStatusBadge status={order.status} />
            </div>

            <div className="order-card-meta">
                <span className="order-date">📅 {formatDate(order.createdAt)}</span>
                <span className="order-items">{order.items?.length || 0} items</span>
            </div>

            <div className="order-card-items">
                {order.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="item-summary">
                        {item.image && (
                            <img
                                src={item.image}
                                alt={item.name}
                                className="item-thumbnail"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        )}
                        <span className="item-name">{item.name}</span>
                        <span className="item-qty">×{item.qty}</span>
                    </div>
                ))}
                {order.items?.length > 3 && (
                    <div className="more-items">
                        +{order.items.length - 3} more items
                    </div>
                )}
            </div>

            <div className="order-card-footer">
                <div className="order-total">
                    <span className="label">Total:</span>
                    <span className="amount">{formatCurrency(order.total)}</span>
                </div>
                <button className="btn-view-details">
                    View Details →
                </button>
            </div>
        </div>
    );
}

export default OrderCard;
